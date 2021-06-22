import { assertUnreachable, sleep } from './utils';
import translations from './translations.json';

export function isSupportedLang(lang: string): lang is SupportedLang {
  return lang === 'en' || lang === 'es' || lang === 'de';
}
export type SupportedLang = 'en' | 'es' | 'de';
interface TranslateParams {
  to: SupportedLang;
  from: SupportedLang;
  word: string;
}
function translate({ to, from, word }: TranslateParams): string {
  if (to === 'en') return toEnglish({ data: word, lang: from }).data;
  if (to === 'es') return toSpanish({ data: word, lang: from }).data;
  if (to === 'de') return toGerman({ data: word, lang: from }).data;
  assertUnreachable(to);
}

interface English {
  lang: 'en';
  data: string;
}
interface Spanish {
  lang: 'es';
  data: string;
}
interface German {
  lang: 'de';
  data: string;
}
type Word = English | Spanish | German;

function toEnglish(w: Word): English {
  if (w.lang === 'en') return w;
  const word = translations.find(t => t[w.lang] === w.data);
  if (!word) return { data: `(${w.data} in english)`, lang: 'en' };
  return { data: word.en, lang: 'en' };
}
function toSpanish(w: Word): Spanish {
  if (w.lang === 'es') return w;
  const word = translations.find(t => t[w.lang] === w.data);
  if (!word) return { data: `(${w.data} en español)`, lang: 'es' };
  return { data: word.es, lang: 'es' };
}
function toGerman(w: Word): German {
  if (w.lang === 'de') return w;
  const word = translations.find(t => t[w.lang] === w.data);
  if (!word) return { data: `(${w.data} auf deutsch)`, lang: 'de' };
  return { data: word.de, lang: 'de' };
}

interface ApiParams {
  words: string[];
  fromLang: SupportedLang;
  toLang: SupportedLang;
}
export default async function apiController(params: ApiParams): Promise<string[]> {
  await sleep(10); // pretend we're talking to some external API.
  return params.words.map(w => translate({ to: params.toLang, from: params.fromLang, word: w }));
}

if (require.main === module) {
  console.log(translate({ to: 'en', from: 'es', word: 'pollo'}));
  console.log(translate({ to: 'de', from: 'en', word: 'watermelon'}));
  console.log(toEnglish(toEnglish({ lang: 'es', data: 'pollo' })));
}
