import { Arguments } from "yargs";

export type GlobalOptions = {
  v?: boolean;
  o?: string;
  b?: string;
  l?: string;
};

export type ToolCliArgs<T> = Arguments<T & GlobalOptions>;
