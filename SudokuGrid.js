const SAVED_GRID = "previousGame";
const USER_INPUT_SAVE = "userInput";

const WINNING_GRID = "winning";
const WRONG_VALUE = "wrong-value";

export default class SudokuGrid {
  __onInput(ev) {
    const { target } = ev;
    const targetCoordinates = this.getCoordinatesFromCell(target);

    this._onBlur();

    if (target.form.checkValidity()) {
      this._checkGrid()
        .then(validGrid =>
          validGrid ? this._winningAnimation(target.form) : this._onFocus(ev)
        )
        .catch(console.error);
    } else if (ev.data !== null) {
      target.reportValidity();
      this._onFocus(ev);
    }
    try {
      localStorage.setItem(USER_INPUT_SAVE + targetCoordinates, target.value);
    } catch {
      console.warn("localStorage not available");
    }
  }

  __onFocus({ target }) {
    const targetCoordinates = this.getCoordinatesFromCell(target);

    const { value, parentNode } = target;
    if (value !== "") {
      const valueClashes = Array.from(parentNode.children)
        .concat(this._rows[targetCoordinates[0]])
        .concat(this._rows.map(row => row[targetCoordinates[1]]))
        .filter(cell => cell !== target && cell.value === value);
      if (valueClashes.length) {
        target.classList.add(WRONG_VALUE);
        valueClashes.forEach(({ classList }) => classList.add(WRONG_VALUE));
      }
    }
  }

  _onBlur() {
    Array.from(
      document.getElementsByClassName(WRONG_VALUE)
    ).forEach(({ classList }) => classList.remove(WRONG_VALUE));
  }

  __onKeyDown(event) {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    const move = [0, 0];

    switch (event.code) {
      case "KeyS":
      case "ArrowDown":
        // Handle "back"
        move[0] = 1;
        break;
      case "KeyW":
      case "ArrowUp":
        // Handle "forward"
        move[0] = -1;
        break;
      case "KeyA":
      case "ArrowLeft":
        // Handle "turn left"
        move[1] = -1;
        break;
      case "KeyD":
      case "ArrowRight":
        // Handle "turn right"
        move[1] = 1;
        break;

      case "Enter":
        event.target.form.reportValidity();
        return;

      default:
        // For any other key, don't do anything
        return;
    }

    event.preventDefault();
    const newCoordinates = this.getCoordinatesFromCell(event.target).map(
      (k, i) => (k + move[i] + 9) % 9
    );
    this.getCellFromCoordinates(...newCoordinates).focus();
  }

  _createCell() {
    const cell = document.createElement("input");
    cell.type = "number";
    cell.maxLength = 1;
    cell.min = 1;
    cell.max = 9;
    cell.required = true;

    cell.addEventListener("input", this._onInput, { passive: true });
    cell.addEventListener("focus", this._onFocus, { passive: true });
    cell.addEventListener("blur", this._onBlur, { passive: true });
    cell.addEventListener("keydown", this._onKeyDown, { passive: false });

    return cell;
  }

  _winningAnimation(form) {
    if ("function" === typeof Element.prototype.animate) {
      const keyframes = {
        opacity: [0, 1],
        backgroundColor: ["white", "green"],
      };
      this._subGrids.flat().map(cell =>
        cell.animate(keyframes, {
          delay: Number(cell.value) * 100 + Math.random(),
          duration: Math.random() * 1000,
        })
      );
    }

    form.classList.add(WINNING_GRID);
  }

  constructor(container, filler) {
    const length = 9;
    const arraySize = { length };

    this._onKeyDown = this.__onKeyDown.bind(this);
    this._onFocus = this.__onFocus.bind(this);
    this._onInput = this.__onInput.bind(this);
    const createCell = this._createCell.bind(this);

    this._subGrids = Array.from(arraySize, () =>
      Array.from(arraySize, createCell)
    );

    this._rows = Array.from(arraySize, (_, i) => {
      const offsetX = i - (i % 3);
      const offsetY = (i * 3) % 9;
      return Array.from(
        arraySize,
        (_, j) => this._subGrids[offsetX + Math.floor(j / 3)][offsetY + (j % 3)]
      );
    });

    this.restoreSavedGame(filler);
    this.insertGrid(container.firstChild, filler);
    requestAnimationFrame(() => container.querySelector("input").focus());
  }

  restoreSavedGame(requestNewGrid) {
    const previousGame = localStorage.getItem(SAVED_GRID);
    if (previousGame) {
      this._fillGame(previousGame);
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const cell = this._rows[i][j];
          if (!cell.readOnly) {
            cell.value = localStorage.getItem(USER_INPUT_SAVE + [i, j]);
          }
        }
      }
    } else {
      requestNewGrid();
    }
  }

  insertGrid(placeholder, filler) {
    const grid = document.createElement("form");
    grid.className = "grid";
    grid.id = "sudoku";
    for (const cells of this._subGrids) {
      const subGrid = document.createElement("div");
      subGrid.className = "grid";
      subGrid.append(...cells);
      grid.append(subGrid);
    }
    placeholder.replaceWith(grid);
    document.getElementById("newGame").addEventListener("click", filler);
    grid.addEventListener("reset", () => {
      try {
        const data = localStorage.getItem(SAVED_GRID);

        localStorage.clear();
        localStorage.setItem(SAVED_GRID, data);
      } catch {
        console.warn("localStorage not available");
      }
    });
  }

  fillNewGame(ev) {
    const { data } = ev;

    Array.from(
      document.getElementsByClassName(WINNING_GRID)
    ).forEach(({ classList }) => classList.remove(WINNING_GRID));

    this._fillGame(data);
    try {
      localStorage.clear();
      localStorage.setItem(SAVED_GRID, data);
    } catch {
      console.warn("localStorage not available");
    }
  }

  _fillGame(data) {
    const cells = this._rows.flat().reverse();
    for (const char of data) {
      const cell = cells.pop();
      if (char === "0") {
        cell.readOnly = false;
        cell.defaultValue = "";
        cell.value = "";
      } else {
        cell.readOnly = true;
        cell.defaultValue = char;
        cell.value = char;
      }
    }
  }

  _checkGrid() {
    return new Promise((resolve, reject) => {
      const extractValues = list => list.map(cell => cell.value);
      const worker = new Worker("./checkGrid.js");
      worker.onmessage = ({ data }) => {
        resolve(!data);
      };
      worker.onerror = reject;
      worker.postMessage({
        subGrids: this._subGrids.map(extractValues),
        rows: this._rows.map(extractValues),
      });
    });
  }

  getCellFromCoordinates(x, y) {
    return this._rows[x][y];
  }

  getCoordinatesFromCell(cell) {
    if (!this._cellCoordinates) {
      this._cellCoordinates = new WeakMap();
    }
    if (!this._cellCoordinates.has(cell)) {
      const row = this._rows.find(row => row.includes(cell));
      this._cellCoordinates.set(cell, [
        this._rows.indexOf(row),
        row.indexOf(cell),
      ]);
    }
    return this._cellCoordinates.get(cell);
  }
}
