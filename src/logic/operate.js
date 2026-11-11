import Big from "big.js";

import { cleanNumber, ERROR } from "./scientific";

/**
 * Above this many digits an exact integer power is not worth computing, so the
 * result falls back to Math.pow (and to ERROR if that overflows the double
 * range). Keeps "999999 x^y 1000000 =" from hanging the browser.
 */
const MAX_EXACT_POWER_DIGITS = 10000;

export default function operate(numberOne, numberTwo, operation) {
  const one = Big(numberOne || "0");
  // If dividing, multiplying or raising to a power, then 1 maintains the
  // current value in cases of null.
  const two = Big(
    numberTwo ||
      (operation === "÷" || operation === "x" || operation === "POW"
        ? "1"
        : "0"),
  );
  if (operation === "+") {
    return one.plus(two).toString();
  }
  if (operation === "-") {
    return one.minus(two).toString();
  }
  if (operation === "x") {
    return one.times(two).toString();
  }
  if (operation === "÷") {
    // This used to test `two === "0"`, which compares a Big to a string and so
    // never matched: big.js threw "[big.js] Division by zero" first.
    if (two.eq(0)) {
      return ERROR;
    }
    return one.div(two).toString();
  }
  if (operation === "POW") {
    const base = Number(one);
    const exponent = Number(two);
    const digits =
      base === 0 ? 0 : Math.abs(exponent * Math.log10(Math.abs(base)));
    if (Number.isInteger(exponent) && digits <= MAX_EXACT_POWER_DIGITS) {
      return one.pow(exponent).toString();
    }
    // big.js only accepts integer exponents, so fractional and very large ones
    // go through Math.pow. A negative base with a fractional exponent is not a
    // real number and comes back as NaN.
    const result = cleanNumber(Math.pow(base, exponent));
    return result === null ? ERROR : result;
  }
  if (operation === "MOD") {
    if (two.eq(0)) {
      return ERROR;
    }
    return one.mod(two).toString();
  }
  throw Error(`Unknown operation '${operation}'`);
}
