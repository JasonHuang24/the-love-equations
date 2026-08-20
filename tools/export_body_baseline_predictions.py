#!/usr/bin/env python3
"""Export shipped-model full-letterbox predictions for a locked training test split."""

import argparse
import csv
import json
import platform
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort

from compare_body_preprocessing import preprocess
from evaluate_body_accuracy import file_sha256, pearson, spearman


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--dataset-root", required=True)
    parser.add_argument("--model", default="models/body-beauty.onnx")
    parser.add_argument("--split", default="test")
    parser.add_argument("--output", required=True)
    parser.add_argument("--provenance-output", required=True)
    args = parser.parse_args()
    manifest_path = Path(args.manifest).resolve()
    dataset_root = Path(args.dataset_root).resolve()
    model_path = Path(args.model).resolve()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schema_version") != "body-training-manifest.v1":
        raise ValueError("unsupported training manifest schema")
    entries = [entry for entry in manifest.get("entries", []) if entry.get("split") == args.split]
    expected = manifest.get("counts", {}).get("splits", {}).get(args.split)
    if len(entries) != expected:
        raise ValueError(f"manifest split count mismatch: {len(entries)} != {expected}")
    if not entries or any(entry.get("variant") != "original" for entry in entries):
        raise ValueError("baseline exporter requires a non-empty originals-only split")
    session = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
    model_input = session.get_inputs()[0]
    model_output = session.get_outputs()[0]
    if model_input.shape[0] not in (1, "batch_size"):
        raise ValueError(f"unexpected model batch shape: {model_input.shape}")
    rows = []
    labels = []
    for entry in sorted(entries, key=lambda value: value["image_id"]):
        relative = Path(entry["image_relpath"])
        if relative.is_absolute() or ".." in relative.parts:
            raise ValueError(f"unsafe image path: {relative}")
        image_path = (dataset_root / relative).resolve()
        image_path.relative_to(dataset_root)
        if file_sha256(image_path) != entry["image_sha256"]:
            raise ValueError(f"image hash mismatch: {entry['image_id']}")
        tensor, _ = preprocess(image_path)
        prediction = float(session.run([model_output.name], {
            model_input.name: tensor[None, ...].astype(np.float32),
        })[0].reshape(-1)[0])
        if not np.isfinite(prediction):
            raise ValueError(f"non-finite prediction: {entry['image_id']}")
        rows.append({"image_id": entry["image_id"], "prediction": repr(prediction)})
        labels.append(float(entry["score"]))
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["image_id", "prediction"], lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    predictions = [float(row["prediction"]) for row in rows]
    provenance = {
        "schema_version": "body-training-baseline-predictions.v1",
        "role": "Shipped-model baseline for the locked originals-only test split; Connor remains training-contaminated for the shipped model.",
        "split": args.split,
        "rows": len(rows),
        "preprocessing": "EXIF-transposed full RGB image; centered black square letterbox; bilinear 224 resize; ImageNet normalization",
        "metrics_diagnostic_only": {
            "spearman": spearman(predictions, labels),
            "pearson": pearson(predictions, labels),
            "warning": "The shipped model was trained on Connor; these are contaminated reference metrics, not independent test evidence.",
        },
        "inputs": {
            "manifest": {"path": str(manifest_path), "sha256": file_sha256(manifest_path)},
            "dataset_archive_sha256": manifest["dataset"]["archive_sha256"],
            "model": {"path": str(model_path), "sha256": file_sha256(model_path)},
        },
        "output": {"path": str(output.resolve()), "sha256": file_sha256(output)},
        "tool_sha256": file_sha256(Path(__file__).resolve()),
        "runtime": {
            "python": platform.python_version(),
            "numpy": np.__version__,
            "onnxruntime": ort.__version__,
            "providers": session.get_providers(),
            "model_input": {"name": model_input.name, "shape": model_input.shape, "type": model_input.type},
            "model_output": {"name": model_output.name, "shape": model_output.shape, "type": model_output.type},
        },
        "command": [sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]],
    }
    provenance_output = Path(args.provenance_output)
    provenance_output.parent.mkdir(parents=True, exist_ok=True)
    provenance_output.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"rows": len(rows), "output_sha256": provenance["output"]["sha256"],
                      "spearman_diagnostic": provenance["metrics_diagnostic_only"]["spearman"]}, indent=2))


if __name__ == "__main__":
    main()
