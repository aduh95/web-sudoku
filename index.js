import SudokuGrid from "./SudokuGrid.js";

const worker = new Worker("./sudoku-generator.js");

const sudokuGrid = new SudokuGrid(
  document.querySelector("main"),
  Worker.prototype.postMessage.bind(worker)
);

worker.addEventListener(
  "message",
  SudokuGrid.prototype.fillNewGame.bind(sudokuGrid)
);
