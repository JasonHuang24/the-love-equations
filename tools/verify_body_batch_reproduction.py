#!/usr/bin/env python3
"""Verify exact CSV and timestamp/command-normalized metadata reproduction."""

import argparse
import hashlib
import json
import sys
from pathlib import Path


def digest_bytes(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def normalized(metadata):
    return {key: value for key, value in metadata.items() if key not in {"generated_at", "command"}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--primary-csv", required=True)
    parser.add_argument("--primary-metadata", required=True)
    parser.add_argument("--repeat-csv", required=True)
    parser.add_argument("--repeat-metadata", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    paths = {name: Path(getattr(args, name.replace("-", "_"))).resolve() for name in (
        "primary-csv", "primary-metadata", "repeat-csv", "repeat-metadata")}
    csv_bytes = {key: paths[key].read_bytes() for key in ("primary-csv", "repeat-csv")}
    metadata = {key: json.loads(paths[key].read_text(encoding="utf-8"))
                for key in ("primary-metadata", "repeat-metadata")}
    for prefix in ("primary", "repeat"):
        reported = metadata[f"{prefix}-metadata"].get("output_csv_sha256")
        actual = digest_bytes(csv_bytes[f"{prefix}-csv"])
        if reported != actual:
            raise ValueError(f"{prefix} metadata does not bind its CSV")
    normalized_metadata = {key: normalized(value) for key, value in metadata.items()}
    csv_equal = csv_bytes["primary-csv"] == csv_bytes["repeat-csv"]
    metadata_equal = normalized_metadata["primary-metadata"] == normalized_metadata["repeat-metadata"]
    report = {
        "schema_version": "body-batch-reproduction.v1",
        "exact_csv_bytes_identical": csv_equal,
        "normalized_metadata_identical": metadata_equal,
        "metadata_fields_ignored": ["command", "generated_at"],
        "primary": {
            "csv": {"path": str(paths["primary-csv"]), "sha256": digest_bytes(csv_bytes["primary-csv"])},
            "metadata": {"path": str(paths["primary-metadata"]), "sha256": digest_bytes(paths["primary-metadata"].read_bytes())},
            "normalized_metadata_sha256": digest_bytes(canonical(normalized_metadata["primary-metadata"])),
        },
        "repeat": {
            "csv": {"path": str(paths["repeat-csv"]), "sha256": digest_bytes(csv_bytes["repeat-csv"])},
            "metadata": {"path": str(paths["repeat-metadata"]), "sha256": digest_bytes(paths["repeat-metadata"].read_bytes())},
            "normalized_metadata_sha256": digest_bytes(canonical(normalized_metadata["repeat-metadata"])),
        },
        "tool_sha256": digest_bytes(Path(__file__).resolve().read_bytes()),
        "command": [sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]],
    }
    if not csv_equal or not metadata_equal:
        raise ValueError(f"reproduction mismatch: csv={csv_equal}, normalized_metadata={metadata_equal}")
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"exact_csv_bytes_identical": csv_equal,
                      "normalized_metadata_identical": metadata_equal,
                      "csv_sha256": report["primary"]["csv"]["sha256"]}, indent=2))


if __name__ == "__main__":
    main()
