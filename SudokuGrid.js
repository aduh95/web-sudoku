const SAVED_GRID = "previousGame";
const USER_INPUT_SAVE = "userInput";

const WRONG_VALUE = "wrong-value";

export default class SudokuGrid {
  /**
   * @type {HTMLInputElement[][]}
   */
  #rows;
  /**
   * @type {HTMLInputElement[][]}
   */
  #subGrids;

  #onInput = ev => {
    const { target } = ev;
    const targetCoordinates = this.getCoordinatesFromCell(target);

    this.#onBlur();

    if (target.form.checkValidity()) {
      this.#checkGrid(target.form);
    } else if (ev.data !== null) {
      target.reportValidity();
      this.#onFocus(ev);
    }
    try {
      localStorage.setItem(USER_INPUT_SAVE + targetCoordinates, target.value);
    } catch {
      console.warn("localStorage not available");
    }
  };

  #onFocus = ({ target }) => {
    const targetCoordinates = this.getCoordinatesFromCell(target);

    const { value, parentNode } = target;
    if (value !== "") {
      const valueClashes = Array.from(parentNode.children)
        .concat(this.#rows[targetCoordinates[0]])
        .concat(this.#rows.map(row => row[targetCoordinates[1]]))
        .filter(cell => cell !== target && cell.value === value);
      if (valueClashes.length) {
        target.classList.add(WRONG_VALUE);
        valueClashes.forEach(({ classList }) => classList.add(WRONG_VALUE));
      }
    }
  };

  #onBlur = () => {
    Array.from(
      document.getElementsByClassName(WRONG_VALUE)
    ).forEach(({ classList }) => classList.remove(WRONG_VALUE));
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
    cell.addEventListener("focus", this.#onFocus, { passive: true });
    cell.addEventListener("blur", this.#onBlur, { passive: true });
    cell.addEventListener("keydown", this.#onKeyDown, { passive: false });

    return cell;
  };

  constructor(container) {
    const length = 9;

    this.#subGrids = Array.from({ length }, () =>
      Array.from({ length }, this.#createCell)
    );

    this.#rows = Array.from({ length }, (_, i) => {
      const offsetX = i - (i % 3);
      const offsetY = (i * 3) % 9;
      return Array.from(
        { length },
        (_, j) => this.#subGrids[offsetX + Math.floor(j / 3)][offsetY + (j % 3)]
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
    for (const cells of this.#subGrids) {
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

  #checkGrid = () => {
    console.warn("TODO");
  };

  getCellFromCoordinates(x, y) {
    return this.#rows[x][y];
  }

  getCoordinatesFromCell(cell) {
    const row = this.#rows.find(row => row.includes(cell));
    return [this.#rows.indexOf(row), row.indexOf(cell)];
  }
}
