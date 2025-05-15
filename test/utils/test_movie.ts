import test from "node:test";
import assert from "node:assert";

import { getVideoPart, getAudioPart } from "../../src/actions/movie.js";

test("test getVideoParts image", async () => {
  const { videoPart } = getVideoPart(1, "image", 200, { width: 100, height: 300 });
  assert.equal(videoPart, "[1:v]loop=loop=-1:size=1:start=0,trim=duration=200,fps=30,setpts=PTS-STARTPTS,scale=100:300,setsar=1,format=yuv420p[v1]");
});

test("test getVideoParts movie", async () => {
  const { videoPart } = getVideoPart(1, "movie", 200, { width: 100, height: 300 });
  assert.equal(videoPart, "[1:v]trim=duration=200,fps=30,setpts=PTS-STARTPTS,scale=100:300,setsar=1,format=yuv420p[v1]");
});

test("test getAudioPart movie", async () => {
  const { audioPart } = getAudioPart(1, 100, 100);
  assert.equal(audioPart, "[1:a]atrim=duration=100,adelay=100|100,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a1]");
});
