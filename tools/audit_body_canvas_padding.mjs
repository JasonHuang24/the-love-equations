import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    index += 1;
  }
  return args;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

export async function runCanvasAudit({ playwrightModule, browserExecutable }) {
  const playwright = await import(pathToFileURL(path.resolve(playwrightModule)).href);
  const browser = await playwright.chromium.launch({
    executablePath: path.resolve(browserExecutable),
    headless: true,
  });
  try {
    const page = await browser.newPage({ viewport: { width: 640, height: 480 } });
    await page.setContent('<!doctype html><title>Body crop padding audit</title>');
    const observed = await page.evaluate(() => {
      const source = document.createElement('canvas');
      source.width = 4;
      source.height = 4;
      const sourceContext = source.getContext('2d', { willReadFrequently: true });
      sourceContext.fillStyle = 'rgb(200, 10, 20)';
      sourceContext.fillRect(0, 0, 4, 4);

      const destination = document.createElement('canvas');
      destination.width = 8;
      destination.height = 8;
      const context = destination.getContext('2d', { willReadFrequently: true });
      context.imageSmoothingEnabled = false;
      context.drawImage(source, -2, -2, 4, 4, 0, 0, 8, 8);
      const data = context.getImageData(0, 0, 8, 8).data;
      let transparentPixels = 0;
      let sourceColorPixels = 0;
      let unexpectedPixels = 0;
      for (let index = 0; index < data.length; index += 4) {
        const pixel = Array.from(data.slice(index, index + 4));
        if (pixel[3] === 0 && pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0) transparentPixels += 1;
        else if (pixel[0] === 200 && pixel[1] === 10 && pixel[2] === 20 && pixel[3] === 255) sourceColorPixels += 1;
        else unexpectedPixels += 1;
      }
      const pixelAt = (x, y) => Array.from(data.slice((y * 8 + x) * 4, (y * 8 + x) * 4 + 4));
      return {
        source: { width: 4, height: 4, rgba: [200, 10, 20, 255] },
        source_rectangle: { x: -2, y: -2, width: 4, height: 4 },
        destination: { width: 8, height: 8, pixels: 64 },
        transparent_pixels: transparentPixels,
        source_color_pixels: sourceColorPixels,
        unexpected_pixels: unexpectedPixels,
        transparent_fraction: transparentPixels / 64,
        samples: {
          top_left: pixelAt(0, 0),
          center: pixelAt(4, 4),
          bottom_right: pixelAt(7, 7),
        },
      };
    });
    return {
      schema_version: 'body-canvas-padding-audit.v1',
      claim: 'Canvas2D clips an out-of-bounds source rectangle and leaves the uncovered destination pixels transparent black; the production RGB preprocessor reads those pixels as zero-valued black.',
      expected_geometry: {
        in_bounds_fraction: 0.25,
        padding_fraction: 0.75,
      },
      observed,
      passed: observed.transparent_pixels === 48
        && observed.source_color_pixels === 16
        && observed.unexpected_pixels === 0
        && observed.transparent_fraction === 0.75
        && observed.samples.top_left.join(',') === '0,0,0,0'
        && observed.samples.bottom_right.join(',') === '200,10,20,255',
      browser: {
        engine: 'chromium',
        version: browser.version(),
        executable: path.resolve(browserExecutable),
      },
      limitations: [
        'This deterministic synthetic Canvas2D fixture proves the browser clipping/padding behavior, not the frequency or score impact of out-of-bounds pose crops in any population.',
        'Dataset incidence and outcome sensitivity are reported separately from production batch instrumentation.',
      ],
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const required of ['playwright-module', 'browser-executable', 'output']) {
    if (!args[required]) throw new Error(`--${required} is required`);
  }
  const result = await runCanvasAudit({
    playwrightModule: args['playwright-module'],
    browserExecutable: args['browser-executable'],
  });
  result.command = process.argv.map(value => /\s/.test(value) ? JSON.stringify(value) : value).join(' ');
  const selfPath = fileURLToPath(import.meta.url);
  result.tool_sha256 = sha256(await fs.readFile(selfPath));
  const output = path.resolve(args.output);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  if (!result.passed) throw new Error('Canvas padding fixture did not match the registered geometry.');
  process.stdout.write(`${JSON.stringify({ output, passed: result.passed, observed: result.observed })}\n`);
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
