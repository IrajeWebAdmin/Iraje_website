// Registers the "@/" alias and the server-only stub for one Node run:
//   node --env-file=.env --import ./scripts/report-loader.mjs scripts/check-report-data.mjs
import { register } from "node:module";

register("./report-loader-hooks.mjs", import.meta.url);
