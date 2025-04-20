#!/usr/bin/env node

import "dotenv/config";

import { args } from "./args";

const main = () => {
  if (args.log) {
    console.log("log")
  }
  console.log("hello");
};
main();
