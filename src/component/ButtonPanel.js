import Button from "./Button";
import React from "react";
import PropTypes from "prop-types";

import "./ButtonPanel.css";

/**
 * Scientific keypad, rendered above the standard keys when enabled.
 *
 * `name` is what calculate() receives and is always digit-free (see
 * src/logic/scientific.js for why); `label` is what the user sees. The ANGLE
 * button has no static label — it shows the current unit and is filled in from
 * props at render time.
 */
const SCIENTIFIC_ROWS = [
  [
    { name: "ANGLE", className: "mode" },
    { name: "SIN", label: "sin" },
    { name: "COS", label: "cos" },
    { name: "TAN", label: "tan" },
    { name: "PI", label: "π" },
  ],
  [
    { name: "SQUARE", label: "x²" },
    { name: "CUBE", label: "x³" },
    { name: "POW", label: "xʸ" },
    { name: "SQRT", label: "√x" },
    { name: "CBRT", label: "∛x" },
  ],
  [
    { name: "LN", label: "ln" },
    { name: "LOG", label: "log" },
    { name: "EXP", label: "eˣ" },
    { name: "POWTEN", label: "10ˣ" },
    { name: "E", label: "e" },
  ],
  [
    { name: "RECIPROCAL", label: "1/x" },
    { name: "FACTORIAL", label: "x!" },
    { name: "ABS", label: "|x|" },
    { name: "MOD", label: "mod" },
    { name: "DEL", label: "⌫" },
  ],
];

export default class ButtonPanel extends React.Component {
  static propTypes = {
    clickHandler: PropTypes.func,
    scientific: PropTypes.bool,
    angleUnit: PropTypes.string,
  };

  handleClick = buttonName => {
    this.props.clickHandler(buttonName);
  };

  render() {
    const { angleUnit, scientific } = this.props;

    return (
      <div
        className={
          scientific
            ? "component-button-panel scientific"
            : "component-button-panel"
        }
      >
        {scientific &&
          SCIENTIFIC_ROWS.map(row => (
            <div className="scientific-row" key={row[0].name}>
              {row.map(button => (
                <Button
                  key={button.name}
                  name={button.name}
                  label={button.name === "ANGLE" ? angleUnit : button.label}
                  className={button.className}
                  clickHandler={this.handleClick}
                />
              ))}
            </div>
          ))}
        <div>
          <Button name="AC" clickHandler={this.handleClick} />
          <Button name="+/-" clickHandler={this.handleClick} />
          <Button name="%" clickHandler={this.handleClick} />
          <Button name="÷" clickHandler={this.handleClick} orange />
        </div>
        <div>
          <Button name="7" clickHandler={this.handleClick} />
          <Button name="8" clickHandler={this.handleClick} />
          <Button name="9" clickHandler={this.handleClick} />
          <Button name="x" clickHandler={this.handleClick} orange />
        </div>
        <div>
          <Button name="4" clickHandler={this.handleClick} />
          <Button name="5" clickHandler={this.handleClick} />
          <Button name="6" clickHandler={this.handleClick} />
          <Button name="-" clickHandler={this.handleClick} orange />
        </div>
        <div>
          <Button name="1" clickHandler={this.handleClick} />
          <Button name="2" clickHandler={this.handleClick} />
          <Button name="3" clickHandler={this.handleClick} />
          <Button name="+" clickHandler={this.handleClick} orange />
        </div>
        <div>
          <Button name="0" clickHandler={this.handleClick} wide />
          <Button name="." clickHandler={this.handleClick} />
          <Button name="=" clickHandler={this.handleClick} orange />
        </div>
      </div>
    );
  }
}
