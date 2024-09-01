import initREmatch from "../src/index.js";

describe("Entry point", () => {
  it("initREmatch function is exported", async () => {
    expect(initREmatch).toBeDefined();
    expect(typeof initREmatch).toBe("function");
  });

  it("REmatch can handle a simple query", async () => {
    const REmatch = await initREmatch();
    const document = "REmatch";
    const pattern = String.raw`!x{RE}!y{match}`;
    const query = REmatch.reql(pattern);
    const matchIterator = query.findIter(document);
    const spans = [];
    for (const match of matchIterator) {
      const x = match.span("x");
      const y = match.span("y");
      spans.push({ x, y });
      match.free();
    }
    query.free();
    matchIterator.free();
    expect(spans).toEqual([{ x: [0, 2], y: [2, 7] }]);
  });

  it("REmatch solves the README query correctly", async () => {
    const REmatch = await initREmatch();
    const document = "cperez@gmail.com\npvergara@ing.uc.cl\njuansoto@uc.cl";
    const pattern = String.raw`@!domain{(\w+\.)+\w+}(\n|$)`;
    const query = REmatch.reql(pattern);
    const matchIterator = query.findIter(document);
    const spans = [];
    for (const match of matchIterator) {
      const domain = match.span("domain");
      spans.push({ domain });
      match.free();
    }
    query.free();
    matchIterator.free();
    expect(spans).toEqual([{ domain: [7, 16] }, { domain: [26, 35] }, { domain: [45, 50] }]);
  });
});
