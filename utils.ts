export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function assertUnreachable(x: never): never {
  throw new Error(`Expected to never reach this case: ${x}`);
}
