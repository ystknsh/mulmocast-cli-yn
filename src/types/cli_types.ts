import { Arguments } from "yargs";

export type GlobalOptions = {
  v?: boolean;
};

export type ToolCliArgs<T = object> = Arguments<T & GlobalOptions>;
