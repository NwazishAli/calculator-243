import React from "react";
import Display from "./Display";
import ButtonPanel from "./ButtonPanel";
import calculate from "../logic/calculate";
import "./App.css";

export default class App extends React.Component {
  state = {
    total: null,
    next: null,
    operation: null,
    scientific: false,
    angleUnit: "DEG",
  };

  handleClick = buttonName => {
    this.setState(calculate(this.state, buttonName));
  };

  render() {
    return (
      <div
        className={
          this.state.scientific ? "component-app scientific" : "component-app"
        }
      >
        <Display
          value={this.state.next || this.state.total || "0"}
          scientific={this.state.scientific}
          clickHandler={this.handleClick}
        />
        <ButtonPanel
          clickHandler={this.handleClick}
          scientific={this.state.scientific}
          angleUnit={this.state.angleUnit}
        />
      </div>
    );
  }
}
