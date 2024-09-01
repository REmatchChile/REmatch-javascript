import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import builtins from "rollup-plugin-node-builtins";

const SRC_DIR = "src";
const INPUT = SRC_DIR + "/index.js";
const LIB_DIR = "lib";
const OUTPUT_PREFIX = LIB_DIR + "/rematch";
const MINIFIER = terser({ keep_classnames: true, keep_fnames: true });
const PLUGINS = [
  nodeResolve({ main: false, module: true, browser: true, preferBuiltins: false }),
  builtins(),
  commonjs(),
];

const COMMON_CONFIG = {
  input: INPUT,
  plugins: PLUGINS,
};

const IIFE_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    file: OUTPUT_PREFIX + ".iife.js",
    format: "iife",
    sourcemap: false,
    name: "initREmatch",
  },
};

const ESM_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    file: OUTPUT_PREFIX + ".esm.js",
    format: "es",
    sourcemap: false,
    name: "initREmatch",
  },
};

const UMD_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    file: OUTPUT_PREFIX + ".umd.js",
    format: "umd",
    sourcemap: false,
    name: "initREmatch",
  },
};

const IIFE_MIN_CONFIG = {
  ...IIFE_CONFIG,
  output: {
    ...IIFE_CONFIG.output,
    file: OUTPUT_PREFIX + ".iife.min.js",
  },
  plugins: [...IIFE_CONFIG.plugins, MINIFIER],
};

const ESM_MIN_CONFIG = {
  ...ESM_CONFIG,
  output: {
    ...ESM_CONFIG.output,
    file: OUTPUT_PREFIX + ".esm.min.js",
  },
  plugins: [...ESM_CONFIG.plugins, MINIFIER],
};

const UMD_MIN_CONFIG = {
  ...UMD_CONFIG,
  output: {
    ...UMD_CONFIG.output,
    file: OUTPUT_PREFIX + ".umd.min.js",
  },
  plugins: [...UMD_CONFIG.plugins, MINIFIER],
};

const INDEX_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    file: LIB_DIR + "/index.js",
    format: "cjs",
    name: "initREmatch",
  },
  plugins: [...COMMON_CONFIG.plugins],
};

export default [IIFE_CONFIG, ESM_CONFIG, UMD_CONFIG, IIFE_MIN_CONFIG, ESM_MIN_CONFIG, UMD_MIN_CONFIG, INDEX_CONFIG];
