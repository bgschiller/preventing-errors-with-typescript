import { sleep } from './utils';
import translations from './translations.json';

function translate(toLang: string, word: string): string {
  if (toLang === 'en') return toEnglish(word);
  if (toLang === 'es') return toSpanish(word);
  throw new Error(`couldn't translate ${word} to ${toLang}`);
}

function toEnglish(s: string): string {
  const word = translations.find(t => t.es === s);
  if (!word) return `(${s} in english)`;
  return word.en;
}
function toSpanish(e: string): string {
  const word = translations.find(t => t.en === e);
  if (!word) return `(${e} en español)`;
  return word.en;
}
// function toGerman(e: string): string {
//   const word = translations.find(t => t.es === e);
//   if (!word) return `(${e} auf deutsch)`;
//   return word.de;
// }

interface ApiParams {
  words: string[];
  toLang: string;
}
export default async function apiController(params: ApiParams): Promise<string[]> {
  await sleep(10); // pretend we're talking to some external API.
  return params.words.map(w => translate(params.toLang, w));
}

if (require.main === module) {
  console.log(translate('english', 'pollo'));
}
