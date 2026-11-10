import Big from "big.js";

import operate from "./operate";
import isNumber from "./isNumber";
import { applyFunction, CONSTANTS, ERROR, UNARY_FUNCTIONS } from "./scientific";

/**
 * Given a button name and a calculator data object, return an updated
 * calculator data object.
 *
 * Calculator data object contains:
 *   total:String       the running total
 *   next:String        the next number to be operated on with the total
 *   operation:String   +, -, etc.
 *   scientific:Boolean whether the scientific keypad is showing
 *   angleUnit:String   "DEG" or "RAD", used by sin/cos/tan
 */

function isConstant(buttonName) {
  return Object.prototype.hasOwnProperty.call(CONSTANTS, buttonName);
}

function isUnaryFunction(buttonName) {
  return UNARY_FUNCTIONS.indexOf(buttonName) !== -1;
}

/** Store a computed value in whichever slot the display is currently reading. */
function setValue(obj, value) {
  // With an operation pending the value on display is the first operand, so a
  // constant or a function result becomes the second one instead of replacing
  // the total: "2 x π" has to keep the 2.
  if (obj.operation) {
    return { next: value };
  }
  return obj.next != null ? { next: value } : { total: value };
}

function errorState() {
  return { next: ERROR, total: null, operation: null };
}

export default function calculate(obj, buttonName) {
  if (buttonName === "AC") {
    return {
      total: null,
      next: null,
      operation: null,
    };
  }

  // The keypad and angle-mode toggles are interface state rather than part of
  // the calculation, which is why AC deliberately leaves them alone.
  if (buttonName === "SCI") {
    return { scientific: !obj.scientific };
  }

  if (buttonName === "ANGLE") {
    return { angleUnit: obj.angleUnit === "RAD" ? "DEG" : "RAD" };
  }

  // While the display reads "Error" every key is inert except one that starts a
  // fresh number. Without this guard the string would reach Big(), which throws
  // on anything that is not numeric.
  if (obj.next === ERROR || obj.total === ERROR) {
    if (isConstant(buttonName)) {
      return { total: null, next: CONSTANTS[buttonName], operation: null };
    }
    if (isNumber(buttonName)) {
      return { total: null, next: buttonName, operation: null };
    }
    if (buttonName === ".") {
      return { total: null, next: "0.", operation: null };
    }
    return {};
  }

  // Constants and unary functions are matched before the digit check below:
  // isNumber() looks for a digit anywhere in the string, so a label like "1/x"
  // would otherwise be treated as the user typing a 1.
  if (isConstant(buttonName)) {
    return setValue(obj, CONSTANTS[buttonName]);
  }

  if (isUnaryFunction(buttonName)) {
    const current = obj.next != null ? obj.next : obj.total;
    const result = applyFunction(
      buttonName,
      current == null ? "0" : current,
      obj.angleUnit,
    );
    return result === null ? errorState() : setValue(obj, result);
  }

  // POW and MOD are binary, so they fall through to the shared operator
  // handling at the bottom, exactly like +, -, x and ÷.

  if (isNumber(buttonName)) {
    if (buttonName === "0" && obj.next === "0") {
      return {};
    }
    // If there is an operation, update next
    if (obj.operation) {
      if (obj.next) {
        return { next: obj.next + buttonName };
      }
      return { next: buttonName };
    }
    // If there is no operation, update next and clear the value
    if (obj.next) {
      const next = obj.next === "0" ? buttonName : obj.next + buttonName;
      return {
        next,
        total: null,
      };
    }
    return {
      next: buttonName,
      total: null,
    };
  }

  if (buttonName === "%") {
    if (obj.operation && obj.next) {
      const result = operate(obj.total, obj.next, obj.operation);
      return {
        total: Big(result)
          .div(Big("100"))
          .toString(),
        next: null,
        operation: null,
      };
    }
    if (obj.next) {
      return {
        next: Big(obj.next)
          .div(Big("100"))
          .toString(),
      };
    }
    return {};
  }

  if (buttonName === ".") {
    if (obj.next) {
      // ignore a . if the next number already has one
      if (obj.next.includes(".")) {
        return {};
      }
      return { next: obj.next + "." };
    }
    return { next: "0." };
  }

  if (buttonName === "=") {
    if (obj.next && obj.operation) {
      return {
        total: operate(obj.total, obj.next, obj.operation),
        next: null,
        operation: null,
      };
    } else {
      // '=' with no operation, nothing to do
      return {};
    }
  }

  if (buttonName === "DEL") {
    // Backspace the value on the display; deleting the last character leaves 0
    // rather than an empty (and unparseable) string.
    const strip = value => {
      const shortened = value.slice(0, -1);
      return shortened === "" || shortened === "-" ? "0" : shortened;
    };
    if (obj.next) {
      return { next: strip(obj.next) };
    }
    if (obj.total) {
      return { total: strip(obj.total) };
    }
    return {};
  }

  if (buttonName === "+/-") {
    if (obj.next) {
      return { next: (-1 * parseFloat(obj.next)).toString() };
    }
    if (obj.total) {
      return { total: (-1 * parseFloat(obj.total)).toString() };
    }
    return {};
  }

  // Button must be an operation

  // When the user presses an operation button without having entered
  // a number first, do nothing.
  // if (!obj.next && !obj.total) {
  //   return {};
  // }

  // User pressed an operation button and there is an existing operation
  if (obj.operation) {
    return {
      total: operate(obj.total, obj.next, obj.operation),
      next: null,
      operation: buttonName,
    };
  }

  // no operation yet, but the user typed one

  // The user hasn't typed a number yet, just save the operation
  if (!obj.next) {
    return { operation: buttonName };
  }

  // save the operation and shift 'next' into 'total'
  return {
    total: obj.next,
    next: null,
    operation: buttonName,
  };
}
