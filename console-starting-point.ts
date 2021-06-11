import translateAPI from './translate-starting-point';
import readline from 'readline'

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
  const endLang = await question("translate to: ");
  const message = await question("message: ");
  const result = translateAPI({
    toLang: endLang,
    words: message.split(/\s+/),
  });
  console.log(result);
  rl.close();
}

main();
