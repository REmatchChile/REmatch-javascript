/**
 * Build the emscripten bindings and put them in the src directory
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const srcDir = path.join(process.cwd(), "src");
const REmatchDir = path.join(process.cwd(), "REmatch");
const buildDir = path.join(process.cwd(), "build/emscripten");

const command = `emcmake cmake -B${buildDir} -DCMAKE_BUILD_TYPE=Release && cmake --build ${buildDir}`;

// Compile the emscripten bindings
execSync(command, { cwd: REmatchDir, stdio: "inherit" });

// Move the emscripten bindings to src/
fs.copyFileSync(path.join(buildDir, "bin/rematch-bindings.js"), path.join(srcDir, "rematch-bindings.js"));
