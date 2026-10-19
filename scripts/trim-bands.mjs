// Finds white (or black) letterbox bands baked into product photos so tags can crop them out.
// Needs ffmpeg on PATH; when it is missing, every photo is treated as untrimmed.
import { execFile } from "node:child_process";

const SIZE = 120;

function grayPixels(id) {
  // The whole image (fit), stretched to a square, so fractions map straight onto the original.
  const url = `https://static.wixstatic.com/media/${id}/v1/fit/w_400,h_400,q_80/file.jpg`;
  return new Promise((resolve) => {
    execFile(
      "ffmpeg",
      ["-v", "error", "-i", url, "-vf", `scale=${SIZE}:${SIZE}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"],
      { encoding: "buffer", maxBuffer: SIZE * SIZE * 4, timeout: 20000 },
      (err, stdout) => resolve(err || stdout.length !== SIZE * SIZE ? null : stdout),
    );
  });
}

// A line is "band" when it is nearly flat and nearly white or nearly black.
function isBand(values) {
  let sum = 0;
  let min = 255;
  let max = 0;
  for (const v of values) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const mean = sum / values.length;
  return max - min < 28 && (mean > 232 || mean < 18);
}

// Returns the content box as fractions [x, y, w, h] of the image, null when there's nothing to trim,
// or undefined when the photo couldn't be read (so the caller can retry later).
export async function contentBox(id) {
  const px = await grayPixels(id);
  if (!px) return undefined;
  const row = (y) => px.subarray(y * SIZE, (y + 1) * SIZE);
  const col = (x) => Array.from({ length: SIZE }, (_, y) => px[y * SIZE + x]);
  let top = 0;
  while (top < SIZE / 2 && isBand(row(top))) top++;
  let bottom = SIZE - 1;
  while (bottom > SIZE / 2 && isBand(row(bottom))) bottom--;
  let left = 0;
  while (left < SIZE / 2 && isBand(col(left))) left++;
  let right = SIZE - 1;
  while (right > SIZE / 2 && isBand(col(right))) right--;
  const w = right - left + 1;
  const h = bottom - top + 1;
  // Ignore hairlines; refuse to crop away more than 60% (likely a cut-out on white, not a band).
  if (SIZE * SIZE - w * h < SIZE * 4 || w * h < SIZE * SIZE * 0.4) return null;
  const pad = 1; // step inside the band edge to avoid a light seam
  return [(left + pad) / SIZE, (top + pad) / SIZE, (w - 2 * pad) / SIZE, (h - 2 * pad) / SIZE].map((n) => +n.toFixed(4));
}

export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k], k);
      }
    }),
  );
  return out;
}
