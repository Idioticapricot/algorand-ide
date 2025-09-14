self.onmessage = async (e) => {
  const { type, filename, code, filepath, template } = e.data;
  console.log(`[Pyodide Worker] Received message:`, { type, filename, template });

  if (type === "init") {
    console.log(`[Pyodide Worker] Initializing for template: ${template}`);
    try {
      console.log(`[Pyodide Worker] Loading Pyodide...`);
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.28.2/full/pyodide.js");
      self.pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.2/full/" });
      console.log(`[Pyodide Worker] Pyodide loaded successfully`);
      
      console.log(`[Pyodide Worker] Loading micropip...`);
      await self.pyodide.loadPackage("micropip");
      const micropip = self.pyodide.pyimport("micropip");
      console.log(`[Pyodide Worker] Micropip loaded successfully`);
      
      if (template === 'Pyteal' || template === 'PyTeal') {
        console.log(`[Pyodide Worker] Installing PyTeal wheel...`);
        await micropip.install(
          "https://files.pythonhosted.org/packages/d4/53/83beac9246e682f22d36bd0c80ab6ec142a680443d51313c302edb810d08/pyteal-0.27.0-py3-none-any.whl",
          { keep_going: true, deps: false }
        );
        console.log(`[Pyodide Worker] PyTeal wheel installed successfully`);
      } else {
        console.log(`[Pyodide Worker] Installing PuyaPy wheel...`);
        await micropip.install(
          "/api/whl/puyapy-4.6.1.6-py3-none-any.whl",
          { keep_going: true }
        );
        console.log(`[Pyodide Worker] PuyaPy wheel installed successfully`);
      }

      self.template = template;
      console.log(`[Pyodide Worker] Initialization complete for ${template}`);
      self.postMessage({ type: "inited" });
    } catch (error) {
      console.error(`[Pyodide Worker] Initialization failed:`, error);
      self.postMessage({ type: "error", error: error.toString() });
    }
  }
  else if (type === "compile") {
    console.log(`[Pyodide Worker] Starting compilation for ${filename} with template ${self.template}`);
    try {
      // Write Python code to virtual filesystem
      console.log(`[Pyodide Worker] Writing file ${filename} to virtual filesystem`);
      self.pyodide.FS.writeFile(filename, code);
      console.log(`[Pyodide Worker] File written successfully, content length: ${code.length}`);

      // Run compiler based on template
      const moduleRun = (self.template === 'Pyteal' || self.template === 'PyTeal') ? `
import sys, time
print(f"[PyTeal] Starting compilation of ${filename}")
start = time.time()
try:
    exec(open("${filename}").read())
    print(f"[PyTeal] Compilation completed successfully")
except Exception as e:
    print(f"[PyTeal] Compilation error: {e}")
    raise
elapsed = time.time() - start
print(f"[PyTeal] Elapsed time: {elapsed:.3f}s")
elapsed
` : `
import sys, time, runpy
print(f"[PuyaPy] Starting compilation of ${filename}")
sys.argv = ["puyapy", "${filename}"]
start = time.time()
try:
    runpy.run_module("puyapy", run_name="__main__")
    print(f"[PuyaPy] Compilation completed successfully")
except Exception as e:
    print(f"[PuyaPy] Compilation error: {e}")
    raise
elapsed = time.time() - start
print(f"[PuyaPy] Elapsed time: {elapsed:.3f}s")
elapsed
`;
      
      console.log(`[Pyodide Worker] Running Python compilation script`);
      const elapsed = self.pyodide.runPython(moduleRun);
      console.log(`[Pyodide Worker] Compilation completed in ${elapsed}s`);

      // Find all files in the filesystem
      console.log(`[Pyodide Worker] Discovering files in virtual filesystem`);
      const findFilesScript = `
import os
files = []
for root, dirs, filenames in os.walk('/'):
    for filename in filenames:
        filepath = os.path.join(root, filename)
        files.append(filepath)
print(f"[File Discovery] Found {len(files)} files total")
files
`;
      const allFiles = self.pyodide.runPython(findFilesScript);
      const filesArray = allFiles.toJs();
      
      // Console log all files
      console.log(`[Pyodide Worker] All files in Pyodide FS (${filesArray.length} total):`, filesArray);
      
      // Read and log specific artifact files
      const artifactExtensions = ['.teal', '.arc32.json', '.puya.map'];
      const artifactFiles = filesArray.filter(file => 
        artifactExtensions.some(ext => file.endsWith(ext))
      );
      
      console.log(`[Pyodide Worker] Found ${artifactFiles.length} artifact files:`, artifactFiles);
      
      artifactFiles.forEach(file => {
        try {
          const content = self.pyodide.FS.readFile(file, { encoding: 'utf8' });
          console.log(`[Pyodide Worker] ${file} (${content.length} chars):`, content.substring(0, 200) + (content.length > 200 ? '...' : ''));
        } catch (e) {
          console.error(`[Pyodide Worker] Could not read ${file}:`, e);
        }
      });

      console.log(`[Pyodide Worker] Compilation successful, sending results`);
      self.postMessage({ type: "compiled", elapsed, files: filesArray });
    } catch (err) {
      console.error(`[Pyodide Worker] Compilation failed:`, err);
      self.postMessage({ type: "error", error: err.toString() });
    }
  }
  else if (type === "readFile") {
    console.log(`[Pyodide Worker] Reading file: ${filepath}`);
    try {
      const content = self.pyodide.FS.readFile(filepath, { encoding: 'utf8' });
      console.log(`[Pyodide Worker] File read successfully: ${filepath} (${content.length} chars)`);
      self.postMessage({ type: "fileRead", content });
    } catch (err) {
      console.error(`[Pyodide Worker] Failed to read file ${filepath}:`, err);
      self.postMessage({ type: "error", error: err.toString() });
    }
  }
};