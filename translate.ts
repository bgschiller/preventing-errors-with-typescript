import { sleep, assertUnreachable } from './utils';
import translations from './translations.json';

// 1. change `toLang: string` to be `toLang: SupportedLang`
// 2. exhaustiveness checking on the languages
// 3. add toGerman. show how this causes exhaustiveness checking to warn us
// 4. Notice that there's no way to translate from spanish to german, and the signatures
//    don't keep us from making that mistake.
type SupportedLang = 'en' | 'es' | 'de'; // 🚩 delete me
function translate(toLang: SupportedLang, word: string): string { // 🚩 change SupportedLang back to string
  if (toLang === 'en') return toEnglish(word);
  if (toLang === 'es') return toSpanish(word);
  if (toLang === 'de') return toGerman(word); // 🚩 remove this case
  assertUnreachable(toLang);
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
// 🚩 comment this back out
function toGerman(e: string): string {
  const word = translations.find(t => t.es === e);
  if (!word) return `(${e} auf deutsch)`;
  return word.de;
}

interface ApiParams {
  words: string[];
  toLang: SupportedLang; // 🚩  change back to string
}
export default async function apiController(params: ApiParams): Promise<string[]> {
  await sleep(10); // pretend we're talking to some external API.
  return params.words.map(w => translate(params.toLang, w));
}

if (require.main === module) {
  console.log(translate('en', 'pollo')); // 🚩 change back to 'english'
}
