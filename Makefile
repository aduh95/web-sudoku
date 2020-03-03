EMCC?= emcc
CC=$(EMCC)

.PHONY: all
all: sudoku-generator.js
	@echo "Done"

%.js: %.cpp
	echo $@
	$(CC) --bind \
		-s FILESYSTEM=0 -s DYNAMIC_EXECUTION=0 -s ENVIRONMENT=worker \
		--post-js post.js \
		-Oz $< -o $@
