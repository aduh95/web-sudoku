# Web Sudoku

Simple Sudoku web interface. The puzzle generator comes from
[vaithak/Sudoku-Generator](https://github.com/vaithak/Sudoku-Generator).

Hosted on my [GitHub Pages](https://aduh95.github.io/web-sudoku/).

### About the project

I have started this project because my grandma was complaining about the time
her iPad took to download her Sudoku game on her slow network connection:
indeed, it was more than 100MiB! For a simple Sudoku app! "That's crazy, I
thought, I can do better than that!" So I did, the result before your eyes
weights 17kiB after Brotli compression, and the user screen is not invaded by
ads.

### Contributing

Note that this project doesn't use any bundling tool or fancy JS framework, the
code source is served directly to the client, like it's 1989 again. If you want
to contribute to the source code, keep in mind you should try to keep backward
compatibility with current versions of major browsers, as the code doesn't get
babelified down the line.

#### On going issues

There is an accessibility issue reported by Lighthouse and Firefox regarding the
lack of `<label>` elements for the `<input>`s. I couldn't figure out a way to
fix it while keeping the grid shape; if you have some knowledge on this topic,
please reach out or send a PR.

### Dependencies

- [`emcc`](https://emscripten.org) (to compile the C++ file to WASM).
- a web server to test locally; I am using [`python3`](https://python.org), but
  any web server would do.
- [`make`](https://www.gnu.org/software/make/manual/make.html), although that's
  not a requirement as the build steps are kind of straight-forward.

### Run on localhost

```shell
# Re-compile the WASM file and starts the Python web server
make clean serve

# Starts the Python web-server without recompiling
make serve
```
