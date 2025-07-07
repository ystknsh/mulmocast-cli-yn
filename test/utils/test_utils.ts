import test from "node:test";
import assert from "node:assert";

import { getExtention } from "../../src/utils/utils.js";

test("test getExtention", async () => {
  const ext = getExtention("image/jpeg", "http://example.com/a.png");
  assert.equal(ext, "jpg");
});

test("test getExtention", async () => {
  const ext = getExtention("image/jpg", "http://example.com/a.png");
  assert.equal(ext, "jpg");
});

test("test getExtention", async () => {
  const ext = getExtention("image/png", "http://example.com/a.png");
  assert.equal(ext, "png");
});

test("test getExtention", async () => {
  const ext = getExtention("text/md", "http://example.com/a.jpg");
  assert.equal(ext, "jpg");
});

test("test getExtention", async () => {
  const ext = getExtention("text/md", "http://example.com/a.gif");
  assert.equal(ext, "png");
});
