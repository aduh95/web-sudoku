const SAVED_GRID = "previousGame";
const USER_INPUT_SAVE = "userInput";

export default class SudokuGrid {
  /**
   * @type {HTMLInputElement[][]}
   */
  #rows;
  /**
   * @type {HTMLInputElement[][]}
   */
  #subGrid;

  #onInput = ev => {
    if (ev.target.form.checkValidity()) {
      console.log("grid full");
    } else if (ev.data !== null) {
      ev.target.reportValidity();
    }
    try {
      localStorage.setItem(
        USER_INPUT_SAVE + this.getCoordinatesFromCell(event.target),
        event.target.value
      );
    } catch {
      console.warn("localStorage not available");
    }
  };

  #onKeyDown = event => {
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
  };

  #createCell = () => {
    const cell = document.createElement("input");
    cell.type = "number";
    cell.maxLength = 1;
    cell.min = 1;
    cell.max = 9;
    cell.required = true;

    cell.addEventListener("input", this.#onInput, { passive: true });
    cell.addEventListener("keydown", this.#onKeyDown, { passive: false });

    return cell;
  };

  constructor(container) {
    const length = 9;

    this.#subGrid = Array.from({ length }, () =>
      Array.from({ length }, this.#createCell)
    );

    this.#rows = Array.from({ length }, (_, i) => {
      const offsetX = i - (i % 3);
      const offsetY = (i * 3) % 9;
      return Array.from(
        { length },
        (_, j) => this.#subGrid[offsetX + Math.floor(j / 3)][offsetY + (j % 3)]
      );
    });

    this.restoreSavedGame();
    this.insertGrid(container.firstChild);
  }

  restoreSavedGame() {
    const previousGame = localStorage.getItem(SAVED_GRID);
    if (previousGame) {
      this.#fillGame(previousGame);
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const cell = this.#rows[i][j];
          if (!cell.readOnly) {
            cell.value = localStorage.getItem(USER_INPUT_SAVE + [i, j]);
          }
        }
      }
    } else {
      console.warn("TODO");
    }
  }

  insertGrid(placeholder) {
    const grid = document.createElement("form");
    grid.className = "grid";
    grid.id = "sudoku";
    for (const cells of this.#subGrid) {
      const subGrid = document.createElement("div");
      subGrid.className = "grid";
      subGrid.append(...cells);
      grid.append(subGrid);
    }
    placeholder.replaceWith(grid);
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
    this.#fillGame(data);
    try {
      localStorage.clear();
      localStorage.setItem(SAVED_GRID, data);
    } catch {
      console.warn("localStorage not available");
    }
  }

  #fillGame = data => {
    const cells = this.#rows.flat().reverse();
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
  };

  getCellFromCoordinates(x, y) {
    return this.#rows[x][y];
  }

  getCoordinatesFromCell(cell) {
    const row = this.#rows.find(row => row.includes(cell));
    return [this.#rows.indexOf(row), row.indexOf(cell)];
  }
}
