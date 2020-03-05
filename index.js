import SudokuGrid from "./SudokuGrid.js";

const sudokuGrid = new SudokuGrid(document.querySelector("main"));

const worker = new Worker("./sudoku-generator.js");

worker.addEventListener("message", sudokuGrid.fillNewGame);

document.getElementById("newGame").addEventListener("click", () => {
  worker.postMessage(true);
});
