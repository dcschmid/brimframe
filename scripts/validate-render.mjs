import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const url = 'https://render.com/schema/render.yaml.json';
const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
if (!response.ok)
  throw new Error(`Render schema request failed: ${response.status}`);
const schema = await response.json();
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const config = parse(
  await readFile(new URL('../render.yaml', import.meta.url), 'utf8'),
);
if (!validate(config)) {
  console.error(validate.errors);
  process.exitCode = 1;
} else {
  console.log(`Render Blueprint passes the current official schema: ${url}`);
}
