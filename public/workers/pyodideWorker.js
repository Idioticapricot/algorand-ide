self.onmessage = async (e) => {
  const { type, filename, code } = e.data;

  if (type === "init") {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.28.2/full/pyodide.js");
    self.pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.2/full/" });
    await self.pyodide.loadPackage("micropip");

    const micropip = self.pyodide.pyimport("micropip");
    await micropip.install(
      "/api/whl/puyapy-4.6.1.6-py3-none-any.whl",
      { keep_going: true }
    );

    self.postMessage({ type: "inited" });
  }
  else if (type === "compile") {
    try {
      // Write Python code to virtual filesystem
      self.pyodide.FS.writeFile(filename, code);

      // Run PuyaPy compiler
      const moduleRun = `
import sys, time, runpy
sys.argv = ["puyapy", "${filename}"]
start = time.time()
runpy.run_module("puyapy", run_name="__main__")
elapsed = time.time() - start
elapsed
`;
      const elapsed = self.pyodide.runPython(moduleRun);

      self.postMessage({ type: "compiled", elapsed });
    } catch (err) {
      self.postMessage({ type: "error", error: err.toString() });
    }
  }
};