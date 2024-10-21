// import commonjs from "@rollup/plugin-commonjs";
const commonjs = require("@rollup/plugin-commonjs");

const SRC_DIR = "src";
const INPUT = SRC_DIR + "/index.js";
const PLUGINS = [commonjs()];

const COMMON_CONFIG = {
  input: INPUT,
  plugins: PLUGINS,
};

const ESM_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    file: "lib/index.mjs",
    esModule: true,
    interop: "esModule",
    exports: "named",
    sourcemap: true,
  },
};

const CJS_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    file: "lib/index.cjs",
    format: "cjs",
    esModule: false,
    interop: "defaultOnly",
    exports: "default",
    sourcemap: true,
  },
};

const UMD_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    name: "initREmatch",
    file: "lib/index.umd.js",
    format: "umd",
    esModule: false,
    interop: "default",
    extend: true,
    sourcemap: true,
  },
};

export default [ESM_CONFIG, CJS_CONFIG, UMD_CONFIG];
