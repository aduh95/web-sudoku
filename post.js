var waitForRuntimeInit = new Promise(function(done) {
  Module.onRuntimeInitialized = done;
});
onmessage = function() {
  waitForRuntimeInit.then(function() {
    postMessage(Module.generatePuzzle());
  });
};
