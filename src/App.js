import { useReducer } from "react";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";
import "./styles.css";

// this project came from a tutorial by Web Dev Simplified
// all comments are my attempt to understand how the overall program work
// I also added some code to address issues that weren't covered in the tutorial such as:
//    - starting with a 0 will crash the project
//    - set the fixed decimal value to be 2 instead of having a bunch of 0s

export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
};

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        };
      }
      // basically, this code doesn't allow the user to add more 0 if the currentOperand on the screen is 0
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state;
      }
      // same as above except with .
      // if the current operand is a decimal, that's also fine, they just can't add more than 1 period
      if (payload.digit === "." && state.currentOperand?.includes(".")) {
        return state;
      }

      // this code is weird
      // so first it returns whatever is in the state
      // then set currentOperand to be the currentOperand in the state and also append the digit after it
      // if we press 8, it will show up as the currentOperand, pressing 8 again will add it to the end of the string
      // and so on and so on
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      };
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state;
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        };
      }

      // if there's no previousOperand, then set it to be currentOperand
      // also set currentOperand 0, we just switch prev and curr around
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }

      // store the calculation of current, previous, operation in previousOperand
      // make currentOperand empty
      // this code allows us to keep adding numbers and they w
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };
    // empties the output
    case ACTIONS.CLEAR:
      return {};
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };
      }
      if (state.currentOperand == null) return state;
      // if there's only a single digit, then makes currentOperand null
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null };
      }

      // keeps removing the last digit from currentOperand until it gets to 1
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };
    case ACTIONS.EVALUATE:
      // if nothing in the state, then return current state
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }

      // after evaluating, make add new key called overwrite, this keeps track of the overwrite status
      // store the evaluation of state's values in currentOperand
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };
    default:
      return state;
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);
  if (isNaN(prev) || isNaN(current)) return "";
  let computation = "";
  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "÷":
      computation = prev / current;
      break;
    default:
      computation = 0;
      break;
  }

  if (!Number.isInteger(computation)) return computation.toFixed(2).toString();
  return computation.toString();
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
});

function formatOperand(operand) {
  if (operand == null) return;
  // splits the number by a period ex: ['10','12'] then we get [integer, operand], should only return an array with 2 elements
  const [integer, decimal] = operand.split(".");
  // if there's no decimal, then just return the integer
  if (decimal == null) return INTEGER_FORMATTER.format(integer);
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}

function App() {
  // currentOperand, previousOperand, and operation are destructured from state, dispatch has our actions
  const [{ currentOperand = "0", previousOperand, operation }, dispatch] =
    useReducer(reducer, {});

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <OperationButton operation="÷" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  );
}

export default App;
