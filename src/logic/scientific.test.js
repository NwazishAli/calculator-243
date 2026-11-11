import chai from "chai";

import isNumber from "./isNumber";
import {
  applyFunction,
  BINARY_FUNCTIONS,
  cleanNumber,
  CONSTANTS,
  isScientific,
  UNARY_FUNCTIONS,
} from "./scientific";

// https://github.com/chaijs/chai/issues/469
chai.config.truncateThreshold = 0;

const expect = chai.expect;

describe("scientific", function() {
  describe("button names", function() {
    // calculate() tests button names with isNumber(), which matches a digit
    // anywhere in the string. A name like "1/x" or "10^x" would therefore be
    // treated as the user typing a number, so the names have to stay digit-free
    // and the labels live on the buttons instead.
    const names = UNARY_FUNCTIONS.concat(
      BINARY_FUNCTIONS,
      Object.keys(CONSTANTS),
      ["SCI", "ANGLE", "DEL"],
    );

    names.forEach(name => {
      it(`${name} is not mistaken for a digit`, () => {
        expect(isNumber(name)).to.equal(false);
      });
    });

    it("recognises every scientific button", () => {
      UNARY_FUNCTIONS.concat(BINARY_FUNCTIONS, Object.keys(CONSTANTS)).forEach(
        name => {
          expect(isScientific(name)).to.equal(true);
        },
      );
      expect(isScientific("+")).to.equal(false);
      expect(isScientific("7")).to.equal(false);
      expect(isScientific("SCI")).to.equal(false);
    });
  });

  describe("cleanNumber", function() {
    it("hides binary float artefacts", () => {
      expect(cleanNumber(0.1 + 0.2)).to.equal("0.3");
    });

    it("snaps float dust to zero", () => {
      expect(cleanNumber(1.2246467991473532e-16)).to.equal("0");
      expect(cleanNumber(-1e-15)).to.equal("0");
    });

    it("keeps ordinary values intact", () => {
      expect(cleanNumber(0)).to.equal("0");
      expect(cleanNumber(-2)).to.equal("-2");
      expect(cleanNumber(1000)).to.equal("1000");
    });

    it("rejects values that are not finite", () => {
      expect(cleanNumber(Infinity)).to.equal(null);
      expect(cleanNumber(-Infinity)).to.equal(null);
      expect(cleanNumber(NaN)).to.equal(null);
      expect(cleanNumber("3")).to.equal(null);
    });
  });

  describe("constants", function() {
    it("exposes pi and e to twelve significant digits", () => {
      expect(CONSTANTS.PI).to.equal("3.14159265359");
      expect(CONSTANTS.E).to.equal("2.71828182846");
    });
  });

  describe("trigonometry", function() {
    it("assumes degrees", () => {
      expect(applyFunction("SIN", "30")).to.equal("0.5");
      expect(applyFunction("COS", "60")).to.equal("0.5");
      expect(applyFunction("TAN", "45")).to.equal("1");
      expect(applyFunction("SIN", "0")).to.equal("0");
    });

    it("reports sin(180 degrees) as exactly zero", () => {
      expect(applyFunction("SIN", "180")).to.equal("0");
    });

    it("uses radians when the angle unit says so", () => {
      expect(applyFunction("SIN", Math.PI / 2, "RAD")).to.equal("1");
      expect(applyFunction("COS", Math.PI, "RAD")).to.equal("-1");
      expect(applyFunction("SIN", "30", "RAD")).to.equal("-0.988031624093");
    });

    it("is undefined where tan has a pole", () => {
      // Math.tan(Math.PI / 2) returns 1.633e16 rather than failing.
      expect(applyFunction("TAN", "90")).to.equal(null);
      expect(applyFunction("TAN", "-90")).to.equal(null);
      expect(applyFunction("TAN", "270")).to.equal(null);
      expect(applyFunction("TAN", Math.PI / 2, "RAD")).to.equal(null);
    });

    it("is still defined just away from the pole", () => {
      expect(applyFunction("TAN", "89")).to.not.equal(null);
    });
  });

  describe("logarithms and exponentials", function() {
    it("takes natural and base-10 logarithms", () => {
      expect(applyFunction("LN", "1")).to.equal("0");
      expect(applyFunction("LN", CONSTANTS.E)).to.equal("1");
      expect(applyFunction("LOG", "1000")).to.equal("3");
      expect(applyFunction("LOG", "1")).to.equal("0");
    });

    it("rejects logarithms of zero and negative numbers", () => {
      expect(applyFunction("LN", "0")).to.equal(null);
      expect(applyFunction("LN", "-1")).to.equal(null);
      expect(applyFunction("LOG", "0")).to.equal(null);
      expect(applyFunction("LOG", "-1")).to.equal(null);
    });

    it("raises e and 10 to the display value", () => {
      expect(applyFunction("EXP", "1")).to.equal("2.71828182846");
      expect(applyFunction("EXP", "0")).to.equal("1");
      expect(applyFunction("POWTEN", "3")).to.equal("1000");
      expect(applyFunction("POWTEN", "-2")).to.equal("0.01");
    });

    it("errors instead of returning Infinity", () => {
      expect(applyFunction("EXP", "1000")).to.equal(null);
    });
  });

  describe("roots and powers", function() {
    it("takes square and cube roots", () => {
      expect(applyFunction("SQRT", "9")).to.equal("3");
      expect(applyFunction("SQRT", "0")).to.equal("0");
      expect(applyFunction("CBRT", "27")).to.equal("3");
      expect(applyFunction("CBRT", "-8")).to.equal("-2");
    });

    it("rejects the square root of a negative number", () => {
      expect(applyFunction("SQRT", "-4")).to.equal(null);
    });

    it("squares and cubes with decimal precision", () => {
      // Math.pow(0.1, 2) is 0.010000000000000002.
      expect(applyFunction("SQUARE", "0.1")).to.equal("0.01");
      expect(applyFunction("CUBE", "3")).to.equal("27");
      expect(applyFunction("SQUARE", "-4")).to.equal("16");
    });
  });

  describe("reciprocal, absolute value and factorial", function() {
    it("inverts a value", () => {
      expect(applyFunction("RECIPROCAL", "4")).to.equal("0.25");
      expect(applyFunction("RECIPROCAL", "-2")).to.equal("-0.5");
      expect(applyFunction("RECIPROCAL", "3")).to.equal(
        "0.33333333333333333333",
      );
    });

    it("rejects division by zero", () => {
      expect(applyFunction("RECIPROCAL", "0")).to.equal(null);
    });

    it("drops the sign", () => {
      expect(applyFunction("ABS", "-7")).to.equal("7");
      expect(applyFunction("ABS", "7")).to.equal("7");
    });

    it("computes factorials", () => {
      expect(applyFunction("FACTORIAL", "0")).to.equal("1");
      expect(applyFunction("FACTORIAL", "1")).to.equal("1");
      expect(applyFunction("FACTORIAL", "5")).to.equal("120");
      expect(applyFunction("FACTORIAL", "10")).to.equal("3628800");
    });

    it("rejects factorials that are negative, fractional or too large", () => {
      expect(applyFunction("FACTORIAL", "-1")).to.equal(null);
      expect(applyFunction("FACTORIAL", "2.5")).to.equal(null);
      expect(applyFunction("FACTORIAL", "171")).to.equal(null);
    });

    it("computes the largest factorial a double can hold", () => {
      expect(applyFunction("FACTORIAL", "170")).to.equal("7.25741561531e+306");
    });
  });

  describe("long results", function() {
    it("shortens values too long to read on the display", () => {
      // 12345678901234^3 is an exact 45-character integer.
      expect(applyFunction("CUBE", "12345678901234")).to.equal(
        "1.88167637235e+39",
      );
    });

    it("keeps results that do fit exact", () => {
      expect(applyFunction("RECIPROCAL", "3")).to.equal(
        "0.33333333333333333333",
      );
      expect(applyFunction("SQUARE", "123456")).to.equal("15241383936");
    });
  });

  describe("bad input", function() {
    it("returns null for anything unparseable", () => {
      expect(applyFunction("SQRT", "Error")).to.equal(null);
      expect(applyFunction("SIN", "")).to.equal(null);
      expect(applyFunction("SQUARE", "abc")).to.equal(null);
    });

    it("returns null for an unknown function", () => {
      expect(applyFunction("NOPE", "3")).to.equal(null);
    });
  });
});
