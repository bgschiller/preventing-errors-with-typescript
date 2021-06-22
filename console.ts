import translateAPI, { isSupportedLang, SupportedLang } from './translate';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ignore this function if you want to. It exists because
// readline uses a callback interface and promises are more convenient
// (util.promisify gets the type definition wrong, or we would use that)
function question(prompt: string): Promise<string> {
  return new Promise(res => rl.question(prompt, res));
}

async function main() {
  const startLang = await question("translate from: ");
  const endLang = await question("translate to: ");
  const message = await question("message: ");
  if (isSupportedLang(startLang) && isSupportedLang(endLang)) {
    const result = await translateAPI({
      fromLang: startLang,
      toLang: endLang,
      words: message.split(/\s+/),
    });
    console.log(result.join(' '));
  } else {
    console.warn('Invalid language');
  }
  rl.close();
}

main();
