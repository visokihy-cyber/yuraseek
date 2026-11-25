// Run after publication: node tools/indexnow.mjs <changed public URLs>
import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile(new URL('./indexnow.json', import.meta.url), 'utf8'));
const urlList = [...new Set(process.argv.slice(2))];
if (!urlList.length) throw new Error('Provide the newly published or changed public URLs.');
for (const value of urlList) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.host !== config.host || url.hash || url.username || url.password) throw new Error('Only canonical production URLs are allowed.');
}
const proof = await fetch(config.keyLocation);
if (!proof.ok || (await proof.text()).trim() !== config.key) throw new Error('Verification file is not published yet.');
const response = await fetch('https://yandex.com/indexnow', {
  method: 'POST', headers: {'Content-Type': 'application/json; charset=utf-8'},
  body: JSON.stringify({...config, urlList}), signal: AbortSignal.timeout(60000)
});
console.log(JSON.stringify({status:response.status, submitted:urlList.length, response:await response.text()}));
if (response.status !== 200 && response.status !== 202) process.exitCode = 1;
