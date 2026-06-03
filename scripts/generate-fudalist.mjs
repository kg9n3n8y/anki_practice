import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = fs.readFileSync(path.join(root, "fudalist.js"), "utf8");
const match = raw.match(/const fudalist = (\[[\s\S]*\]);/);

if (!match) {
  console.error("fudalist.js のパースに失敗しました");
  process.exit(1);
}

const list = eval(match[1]);
const poems = list.map((p) => ({
  no: p.no,
  kimariji: p.kimariji,
  normal: p.normal.replace("./torifuda/", "torifuda/"),
  reverse: p.reverse.replace("./torifuda/", "torifuda/"),
  order: p.order,
}));

const out = `import type { Poem } from "../types";

export const fudalist: Poem[] = ${JSON.stringify(poems, null, 2)};
`;

const dest = path.join(root, "src/data/fudalist.ts");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`Wrote ${poems.length} poems to ${dest}`);
