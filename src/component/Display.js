import React from "react";
import PropTypes from "prop-types";

import "./Display.css";

export default class Display extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    scientific: PropTypes.bool,
    clickHandler: PropTypes.func,
  };

  handleToggle = () => {
    if (this.props.clickHandler) {
      this.props.clickHandler("SCI");
    }
  };

  render() {
    return (
      <div className="component-display">
        <button
          className="component-display-toggle"
          onClick={this.handleToggle}
          title="Toggle the scientific keypad"
        >
          {this.props.scientific ? "BASIC" : "SCI"}
        </button>
        <div>{this.props.value}</div>
      </div>
    );
  }
}
