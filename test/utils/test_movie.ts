import test from "node:test";
import assert from "node:assert";

import { getPart } from "../../src/actions/movie.js";

test("test getParts image", async () => {
  const { part } = getPart(1, "image", 200, { width: 100, height: 300 });
  assert.equal(part, "[1:v]loop=loop=-1:size=1:start=0,trim=duration=200,fps=30,setpts=PTS-STARTPTS,scale=100:300,setsar=1,format=yuv420p[v1]");
});

test("test getParts movie", async () => {
  const { part } = getPart(1, "movie", 200, { width: 100, height: 300 });
  assert.equal(part, "[1:v]trim=duration=200,fps=30,setpts=PTS-STARTPTS,scale=100:300,setsar=1,format=yuv420p[v1]");
});
