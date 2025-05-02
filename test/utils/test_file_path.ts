import { getBaseDirPath, getFullPath } from "../../src/utils/file";

import test from "node:test";
import assert from "node:assert";

test("test getBaseDirPath pwd", async () => {
  const path = getBaseDirPath()
  assert.deepStrictEqual(path, process.cwd());
});

test("test getBaseDirPath absolute", async () => {
  const path = getBaseDirPath("/foo//aa")
  assert.deepStrictEqual(path, "/foo/aa");
});

test("test getBaseDirPath related", async () => {
  const path = getBaseDirPath("foo//aa")
  assert.deepStrictEqual(path, process.cwd() + "/foo/aa");
});


test("test getFullPath base is not set", async () => {
  const path = getFullPath(undefined as unknown as string, "foo//aa")
  assert.deepStrictEqual(path, process.cwd() + "/foo/aa");
});

