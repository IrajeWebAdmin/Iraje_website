// Copies PDF.js's background "worker" file into public/ so the browser can load
// it from /pdf.worker.min.mjs. Runs automatically before `npm run dev` and
// `npm run build` ("predev" / "prebuild" in package.json), so it always matches
// the installed pdfjs-dist version.
import { copyFileSync } from "node:fs";

copyFileSync("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "public/pdf.worker.min.mjs");
console.log("Copied pdf.worker.min.mjs to public/");
