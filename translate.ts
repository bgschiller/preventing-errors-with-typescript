import { sleep, assertUnreachable } from './utils';
import translations from './translations.json';

// 1. change `toLang: string` to be `toLang: SupportedLang`
// 2. exhaustiveness checking on the languages
// 3. add toGerman. show how this causes exhaustiveness checking to warn us
// 4. Notice that there's no way to translate from spanish to german, and the signatures
//    don't keep us from making that mistake.
type SupportedLang = 'en' | 'es' | 'de'; // 🚩 delete me
function translate(toLang: SupportedLang, word: string): string { // 🚩 change SupportedLang back to string
  if (toLang === 'en') return toEnglish({ data: word, lang: 'es' }).data;
  if (toLang === 'es') return toSpanish({ data: word, lang: 'en' }).data;
  if (toLang === 'de') return toGerman({ data: word, lang: 'en' }).data;
  assertUnreachable(toLang);
}

interface Word<T extends SupportedLang = SupportedLang> {
  lang: T;
  data: string;
}

function isLang<T extends SupportedLang>(w: Word, lang: T): w is Word<T> {
  return w.lang === lang;
}

function toEnglish(w: Word): Word<'en'> {
  if (isLang(w, 'en')) return w;
  const word = translations.find(t => t[w.lang] === w.data);
  if (!word) return { lang: 'en', data: `(${w.data} in english)` };
  return { data: word.en, lang: 'en' };
}
function toSpanish(w: Word): Word<'es'> {
  if (isLang(w, 'es')) return w;
  const word = translations.find(t => t[w.lang] === w.data);
  if (!word) return { data: `(${w.data} en español)`, lang: 'es' };
  return { data: word.en, lang: 'es' };
}
function toGerman(w: Word): Word<'de'> {
  if (isLang(w, 'de')) return w;
  const word = translations.find(t => t[w.lang] === w.data);
  if (!word) return { data: `(${w.data} auf deutsch)`, lang: 'de' };
  return { data: word.de, lang: 'de' };
}

interface ApiParams {
  words: string[];
  toLang: SupportedLang;
}
export default async function apiController(params: ApiParams): Promise<string[]> {
  await sleep(10); // pretend we're talking to some external API.
  return params.words.map(w => translate(params.toLang, w));
}

if (require.main === module) {
  console.log(translate('en', 'pollo'));
  console.log(toEnglish(toEnglish({ data: 'pollo', lang: 'en' })));
}
