import readline from 'readline';

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function assertUnreachable(x: never): never {
  throw new Error(`Expected to never reach this case: ${x}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

process.on('exit', () => {
  rl.close();
})

// (util.promisify gets the type definition wrong, or we would use that)
export function question(prompt: string): Promise<string> {
  return new Promise(res => rl.question(prompt, res));
}
