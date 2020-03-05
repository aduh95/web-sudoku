EMCC?= emcc
CC=$(EMCC)

.PHONY: all
all: build

.PHONY: clean
clean:
	rm -f sudoku-generator.js *.wasm

.PHONY: build
build: sudoku-generator.js
	@echo "Done"

.PHONY: serve
serve: sudoku-generator.js
	python3 -m http.server

%.js: %.cpp
	$(CC) --bind \
		-s FILESYSTEM=0 -s DYNAMIC_EXECUTION=0 -s ENVIRONMENT=worker \
		--post-js post.js \
		-Oz $< -o $@
