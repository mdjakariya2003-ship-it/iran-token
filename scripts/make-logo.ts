import { PNG } from "pngjs";
import fs from "node:fs";

const S = 512;
const png = new PNG({ width: S, height: S });
const R = S / 2 - 6;

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const i = (S * y + x) << 2;
    const d = Math.hypot(x - S / 2 + 0.5, y - S / 2 + 0.5);
    let rgba = [0, 0, 0, 0];
    if (d <= R - 8) {
      rgba = y < S / 3 ? [35, 159, 64, 255] : y < (2 * S) / 3 ? [255, 255, 255, 255] : [218, 0, 0, 255];
    } else if (d <= R) {
      rgba = [50, 50, 50, 255];
    }
    png.data[i] = rgba[0]; png.data[i + 1] = rgba[1];
    png.data[i + 2] = rgba[2]; png.data[i + 3] = rgba[3];
  }
}
fs.mkdirSync("assets", { recursive: true });
fs.writeFileSync("assets/logo.png", PNG.sync.write(png));
console.log("Wrote assets/logo.png");
