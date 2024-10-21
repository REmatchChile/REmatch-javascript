const fs = require("fs");
const { minify } = require("terser");

// Minify UMD
const unminified = fs.readFileSync("lib/index.umd.js", "utf8");
minify(unminified, {
  ecma: 2020,
  mangle: { toplevel: true },
  compress: {
    module: true,
    toplevel: true,
    unsafe_arrows: true,
    drop_console: true,
    drop_debugger: true,
  },
}).then((minfied) => {
  fs.writeFileSync("lib/index.umd.min.js", minfied.code);
});
