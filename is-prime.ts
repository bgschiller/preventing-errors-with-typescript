function isPrime(candidate: number): boolean {
  if (candidate % 2 === 0) return false;
  let divisor = 3;
  const largestPossibleDivisor = Math.sqrt(candidate);
  while (divisor < largestPossibleDivisor) {
    if (candidate % divisor === 0) return false;
    divisor += 2;
  }
  return true;
}

const twoIsPrime = isPrime(2);
const thirtyNineIsPrime = isPrime(39);
