function considerTemp(value: number, units: string) {
  if (units === 'celsius') {
    if (value > 37) return "it's really hot";
    if (value < -6) return "it's really cold";
    return "we can handle it";
  } else if (units === 'fahrenheit') {
    if (value > 100) return "it's really hot";
    if (value < 20) return "it's really cold";
    return "we can handle it";
  }
}

console.log("Here's how we feel about 45°C: " + considerTemp(45, 'C'));
