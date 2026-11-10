import Big from "big.js";

/**
 * Scientific functions for the calculator.
 *
 * Button names are deliberately digit-free ("RECIPROCAL" instead of "1/x",
 * "POW10" instead of "10^x") because calculate() routes anything matching
 * /[0-9]+/ down the digit-entry branch — isNumber() tests for a digit anywhere
 * in the string, not for a numeric string. The text the user actually sees is
 * supplied separately as each Button's `label`. There is a test that fails if a
 * scientific name ever grows a digit.
 */

/** What the display shows when an operation has no valid result. */
export const ERROR = "Error";

/** Functions that transform the value currently on the display. */
export const UNARY_FUNCTIONS = [
  "SIN",
  "COS",
  "TAN",
  "LN",
  "LOG",
  "SQRT",
  "CBRT",
  "SQUARE",
  "CUBE",
  "RECIPROCAL",
  "FACTORIAL",
  "EXP",
  "POWTEN",
  "ABS",
];

/** Functions that need two operands; handled by operate(), not applyFunction(). */
export const BINARY_FUNCTIONS = ["POW", "MOD"];

/**
 * Turn a JS number into a display string.
 *
 * Returns null when there is no valid result, which callers turn into ERROR.
 * Transcendental functions go through Math (IEEE doubles), so the value is
 * rounded to 12 significant digits to hide binary float artefacts such as
 * 0.30000000000000004, and anything below 1e-12 is snapped to zero — that is
 * what makes sin(180°) read as 0 instead of 1.22464679915e-16.
 */
export function cleanNumber(value) {
  if (typeof value !== "number" || !isFinite(value)) {
    return null;
  }
  if (value === 0 || Math.abs(value) < 1e-12) {
    return "0";
  }
  return new Big(parseFloat(value.toPrecision(12))).toString();
}

export const CONSTANTS = {
  PI: cleanNumber(Math.PI),
  E: cleanNumber(Math.E),
};

export function isScientific(buttonName) {
  return (
    UNARY_FUNCTIONS.indexOf(buttonName) !== -1 ||
    BINARY_FUNCTIONS.indexOf(buttonName) !== -1 ||
    Object.prototype.hasOwnProperty.call(CONSTANTS, buttonName)
  );
}

function toNumber(value) {
  return typeof value === "number" ? value : parseFloat(value);
}

function toRadians(value, angleUnit) {
  return angleUnit === "RAD" ? value : (value * Math.PI) / 180;
}

/**
 * Results longer than this are unreadable on the display — 170! runs to 272
 * characters — so they fall back to twelve significant digits instead.
 */
const MAX_DISPLAY_LENGTH = 24;

function shorten(value) {
  const exact = value.toString();
  if (exact.length <= MAX_DISPLAY_LENGTH) {
    return exact;
  }
  return cleanNumber(Number(exact)) || exact;
}

/**
 * Exact where big.js can help (squaring 0.1 gives 0.01, not
 * 0.010000000000000002), and Math elsewhere.
 */
function bigPower(value, exponent) {
  return shorten(new Big(value).pow(exponent));
}

/**
 * Largest factorial that still fits in a double; beyond it the result is
 * Infinity. big.js keeps every digit exact up to that point.
 */
const MAX_FACTORIAL = 170;

function factorial(value) {
  if (value < 0 || !Number.isInteger(value) || value > MAX_FACTORIAL) {
    return null;
  }
  let result = new Big(1);
  for (let i = 2; i <= value; i++) {
    result = result.times(i);
  }
  return shorten(result);
}

/**
 * Apply a unary scientific function to `rawValue`.
 *
 * Returns the new display value as a string, or null when the input is outside
 * the function's domain (sqrt of a negative, log of zero, tan of 90°, ...).
 */
export function applyFunction(buttonName, rawValue, angleUnit = "DEG") {
  const numeric = toNumber(rawValue);
  if (isNaN(numeric)) {
    return null;
  }
  if (!isFinite(numeric)) {
    return null;
  }

  switch (buttonName) {
    case "SIN":
      return cleanNumber(Math.sin(toRadians(numeric, angleUnit)));
    case "COS":
      return cleanNumber(Math.cos(toRadians(numeric, angleUnit)));
    case "TAN": {
      // Math.tan(Math.PI / 2) happily returns 1.6e16 instead of failing, so
      // reject the odd multiples of 90° where tan is undefined.
      const radians = toRadians(numeric, angleUnit);
      if (Math.abs(Math.cos(radians)) < 1e-12) {
        return null;
      }
      return cleanNumber(Math.tan(radians));
    }
    case "LN":
      return numeric > 0 ? cleanNumber(Math.log(numeric)) : null;
    case "LOG":
      return numeric > 0 ? cleanNumber(Math.log10(numeric)) : null;
    case "SQRT":
      return numeric >= 0 ? cleanNumber(Math.sqrt(numeric)) : null;
    case "CBRT":
      return cleanNumber(Math.cbrt(numeric));
    case "SQUARE":
      return bigPower(rawValue, 2);
    case "CUBE":
      return bigPower(rawValue, 3);
    case "RECIPROCAL":
      return numeric === 0 ? null : shorten(new Big(1).div(new Big(rawValue)));
    case "FACTORIAL":
      return factorial(numeric);
    case "EXP":
      return cleanNumber(Math.exp(numeric));
    case "POWTEN":
      return cleanNumber(Math.pow(10, numeric));
    case "ABS":
      return cleanNumber(Math.abs(numeric));
    default:
      return null;
  }
}
