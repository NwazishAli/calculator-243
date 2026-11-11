import calculate from "./calculate";
import chai from "chai";

// https://github.com/chaijs/chai/issues/469
chai.config.truncateThreshold = 0;

const expect = chai.expect;

function pressButtons(buttons) {
  const value = {};
  buttons.forEach(button => {
    Object.assign(value, calculate(value, button));
  });
  // no need to distinguish between null and undefined values
  Object.keys(value).forEach(key => {
    if (value[key] === null) {
      delete value[key];
    }
  });
  return value;
}

function expectButtons(buttons, expectation) {
  expect(pressButtons(buttons)).to.deep.equal(expectation);
}

function test(buttons, expectation, only = false) {
  const func = only ? it.only : it;
  func(`buttons ${buttons.join(",")} -> ${JSON.stringify(expectation)}`, () => {
    expectButtons(buttons, expectation);
  });
}

describe("calculate", function() {
  test(["6"], { next: "6" });

  test(["6", "6"], { next: "66" });

  test(["6", "+", "6"], {
    next: "6",
    total: "6",
    operation: "+",
  });

  test(["6", "+", "6", "="], {
    total: "12",
  });

  test(["0", "0", "+", "0", "="], {
    total: "0",
  });

  test(["6", "+", "6", "=", "9"], {
    next: "9",
  });

  test(["3", "+", "6", "=", "+"], {
    total: "9",
    operation: "+",
  });

  test(["3", "+", "6", "=", "+", "9"], {
    total: "9",
    operation: "+",
    next: "9",
  });

  test(["3", "+", "6", "=", "+", "9", "="], {
    total: "18",
  });

  // When '=' is pressed and there is not enough information to complete
  // an operation, the '=' should be disregarded.
  test(["3", "+", "=", "3", "="], {
    total: "6",
  });

  test(["+"], {
    operation: "+",
  });

  test(["+", "2"], {
    next: "2",
    operation: "+",
  });

  test(["+", "2", "+"], {
    total: "2",
    operation: "+",
  });

  test(["+", "2", "+", "+"], {
    total: "2",
    operation: "+",
  });

  test(["+", "2", "+", "5"], {
    next: "5",
    total: "2",
    operation: "+",
  });

  test(["+", "2", "5"], {
    next: "25",
    operation: "+",
  });

  test(["+", "2", "5"], {
    next: "25",
    operation: "+",
  });

  test(["+", "6", "+", "5", "="], {
    total: "11",
  });

  test(["0", ".", "4"], {
    next: "0.4",
  });

  test([".", "4"], {
    next: "0.4",
  });

  test([".", "4", "-", ".", "2"], {
    total: "0.4",
    next: "0.2",
    operation: "-",
  });

  test([".", "4", "-", ".", "2", "="], {
    total: "0.2",
  });

  // should clear the operator when AC is pressed
  test(["1", "+", "2", "AC"], {});
  test(["+", "2", "AC"], {});

  test(["4", "%"], {
    next: "0.04",
  });

  test(["4", "%", "x", "2", "="], {
    total: "0.08",
  });

  test(["4", "%", "x", "2"], {
    total: "0.04",
    operation: "x",
    next: "2",
  });

  // the percentage sign should also act as '='
  test(["2", "x", "2", "%"], {
    total: "0.04",
  });

  //Test that pressing the multiplication or division sign multiple times should not affect the current computation
  test(["2", "x", "x"], {
    total: "2",
    operation: "x"
  });

  test(["2", "÷", "÷"], {
    total: "2",
    operation: "÷"
  });

  test(["2", "÷", "x", "+", "-", "x"], {
    total: "2",
    operation: 'x'
  });
});

describe("calculate (scientific)", function() {
  // The keypad and angle-unit toggles are interface state.
  test(["SCI"], { scientific: true });
  test(["SCI", "SCI"], { scientific: false });
  test(["ANGLE"], { angleUnit: "RAD" });
  test(["ANGLE", "ANGLE"], { angleUnit: "DEG" });

  // AC clears the calculation but leaves the keypad and angle unit alone.
  test(["SCI", "ANGLE", "5", "AC"], { scientific: true, angleUnit: "RAD" });

  // Unary functions apply to whatever is on the display, and chain.
  test(["9", "SQRT"], { next: "3" });
  test(["9", "SQRT", "SQUARE"], { next: "9" });
  test(["5", "FACTORIAL"], { next: "120" });
  test(["1", "0", "0", "LOG"], { next: "2" });
  test(["4", "+/-", "ABS"], { next: "4" });

  // Trigonometry follows the angle unit.
  test(["3", "0", "SIN"], { next: "0.5" });
  test(["3", "0", "SIN", "ANGLE"], { next: "0.5", angleUnit: "RAD" });
  test(["ANGLE", "3", "0", "SIN"], {
    angleUnit: "RAD",
    next: "-0.988031624093",
  });
  test(["9", "0", "TAN"], { next: "Error" });

  // Constants behave like a typed number, so they can start a calculation.
  test(["PI"], { total: "3.14159265359" });
  test(["PI", "+", "2", "="], { total: "5.14159265359" });
  test(["2", "x", "E"], { total: "2", operation: "x", next: "2.71828182846" });

  // A unary function keeps a pending operation alive: 5 + 3^2 =
  test(["5", "+", "3", "SQUARE", "="], { total: "14" });

  // POW and MOD are binary and ride the same path as +, -, x and ÷.
  test(["2", "POW", "1", "0", "="], { total: "1024" });
  test(["2", "POW", "0", ".", "5", "="], { total: "1.41421356237" });
  test(["2", "POW"], { total: "2", operation: "POW" });
  test(["7", "MOD", "3", "="], { total: "1" });
  test(["2", "MOD", "0", "="], { total: "Error" });

  // Out-of-domain input shows an error rather than throwing or returning NaN.
  test(["4", "+/-", "SQRT"], { next: "Error" });
  test(["0", "RECIPROCAL"], { next: "Error" });
  test(["0", "LN"], { next: "Error" });
  test(["5", "÷", "0", "="], { total: "Error" });

  // While an error is showing every key is inert except one that starts a new
  // number, so the string can never be fed back into Big().
  test(["0", "RECIPROCAL", "="], { next: "Error" });
  test(["0", "RECIPROCAL", "+"], { next: "Error" });
  test(["0", "RECIPROCAL", "7"], { next: "7" });
  test(["0", "RECIPROCAL", "."], { next: "0." });
  test(["0", "RECIPROCAL", "PI"], { next: "3.14159265359" });
  test(["0", "RECIPROCAL", "AC"], {});
  // An error discards the whole calculation, so a later = has nothing to do.
  test(["5", "+", "0", "RECIPROCAL", "3", "="], { next: "3" });

  // The blank display reads as 0, and 10^0 is 1.
  test(["POWTEN"], { total: "1" });
  test(["1", "0", "POWTEN"], { next: "10000000000" });

  // Backspace.
  test(["1", "2", "3", "DEL"], { next: "12" });
  test(["1", "DEL"], { next: "0" });
  test(["9", "SQRT", "DEL"], { next: "0" });
  test(["5", "+", "3", "DEL"], { total: "5", operation: "+", next: "0" });
  test(["DEL"], {});
});
