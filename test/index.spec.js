const initREmatch = require("../lib/index.cjs");

describe("Entry point", () => {
  it("initREmatch function is exported", async () => {
    expect(initREmatch).toBeDefined();
    expect(typeof initREmatch).toBe("function");
  });

  it("REmatch solves the README query correctly", async () => {
    // Create a REmatch module instance
    const REmatch = await initREmatch();

    // Define the document and pattern to search for
    const document = "cperez@gmail.com\npvergara@ing.uc.cl\njuansoto@uc.cl";
    const pattern = String.raw`@!domain{(\w+\.)+\w+}(\n|$)`;

    // Create a REQL query
    const query = REmatch.reql(pattern);

    // Execute the query and show the matches
    const matchIterator = query.findIter(document);
    for (const match of matchIterator) {
      console.log(`Match: ${match.toString()}`);

      // Current match will no longer be used
      match.free();
    }

    // Query and MatchIterator will no longer be used
    query.free();
    matchIterator.free();
    expect(spans).toEqual([{ domain: [7, 16] }, { domain: [26, 35] }, { domain: [45, 50] }]);
  });

  it("Match methods work correctly", async () => {
    const REmatch = await initREmatch();
    const document = "hola mundo";
    const pattern = String.raw`!x{hola} mundo`;
    const query = REmatch.reql(pattern);
    const match = query.findOne(document);

    const startIndex = match.start(0);
    const startVar = match.start("x");
    const startExpected = 0;
    expect(startIndex).toBe(startExpected);
    expect(startVar).toBe(startExpected);

    const endIndex = match.end(0);
    const endVar = match.end("x");
    const endExpected = 4;
    expect(endIndex).toBe(endExpected);
    expect(endVar).toBe(endExpected);

    const spanIndex = match.span(0);
    const spanVar = match.span("x");
    const spanExpected = [0, 4];
    expect(spanIndex).toEqual(spanExpected);
    expect(spanVar).toEqual(spanExpected);

    const groupIndex = match.group(0);
    const groupVar = match.group("x");
    const groupExpected = "hola";
    expect(groupIndex).toBe(groupExpected);
    expect(groupVar).toBe(groupExpected);

    const empty = match.empty();
    expect(empty).toBe(false);

    const variables = match.variables();
    expect(variables).toEqual(["x"]);

    const toString = match.toString();
    expect(toString).not.toHaveLength(0);

    match.free();
    query.free();
  });

  it("MultiMatch methods work correctly", async () => {
    const REmatch = await initREmatch();
    const document = "blabla";
    const pattern = String.raw`!x{bla}!x{bla}`;
    const query = REmatch.multiReql(pattern);
    const multiMatch = query.findOne(document);

    const spansIndex = multiMatch.spans(0);
    const spansVar = multiMatch.spans("x");
    const spansExpected = [
      [0, 3],
      [3, 6],
    ];
    expect(spansIndex).toEqual(spansExpected);
    expect(spansVar).toEqual(spansExpected);

    const groupsIndex = multiMatch.groups(0);
    const groupsVar = multiMatch.groups("x");
    const groupsExpected = ["bla", "bla"];
    expect(groupsIndex).toEqual(groupsExpected);
    expect(groupsVar).toEqual(groupsExpected);

    const submatch = multiMatch.submatch([0, 3]);
    expect(submatch.spans(0)).toEqual([[0, 3]]);

    const empty = multiMatch.empty();
    expect(empty).toBe(false);

    const variables = multiMatch.variables();
    expect(variables).toEqual(["x"]);

    const toString = multiMatch.toString();
    expect(toString).not.toHaveLength(0);

    multiMatch.free();
    query.free();
  });

  it("Query.finditer works correctly", async () => {
    const REmatch = await initREmatch();
    const document = "thathathat";
    const pattern = String.raw`!x{that}`;
    const query = REmatch.reql(pattern);
    const it = query.findIter(document);

    const spans = [];
    for (const match of it) {
      const span = match.span(0);
      spans.push(span);
      match.free();
    }
    expect(spans).toEqual([
      [0, 4],
      [3, 7],
      [6, 10],
    ]);

    it.free();
    query.free();
  });

  it("MultiQuery.finditer works correctly", async () => {
    const REmatch = await initREmatch();
    const document = "blablabla";
    const pattern = String.raw`!x{bla}!x{bla}`;
    const query = REmatch.multiReql(pattern);
    const it = query.findIter(document);

    const spans = [];
    for (const match of it) {
      const span = match.spans(0);
      spans.push(span);
      match.free();
    }
    expect(spans).toEqual([
      [
        [0, 3],
        [3, 6],
      ],
      [
        [3, 6],
        [6, 9],
      ],
    ]);

    it.free();
    query.free();
  });
});
