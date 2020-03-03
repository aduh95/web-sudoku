const gridElement = document.querySelector("main");

const worker = new Worker("./sudoku-generator.js");

worker.addEventListener("message", ev => {
  const cells = gridElement.querySelectorAll("input");
  const { data } = ev;
  let i = 0;
  for (const char of data) {
    const cell = cells.item(i++);
    if (char === "0") {
      cell.readOnly = false;
      cell.value = "";
    } else {
      cell.readOnly = true;
      cell.value = char;
    }
  }
});

document.getElementById("newGame").addEventListener("click", () => {
  worker.postMessage(true);
});
