import type { LogKind } from "../../log";
import type { Environment, LineNo } from "../types";

export type Finding = {
  key: string;
  message: string;
  solutions: string[];
};

export type ReadContext = {
  head: string;
  environment: Environment;
  kind: LogKind;
};

export type Rule = {
  id: string;
  minCount?: number;
  read(line: string, context: ReadContext): Finding | null;
};

export type Problem = {
  id: string;
  message: string;
  solutions: string[];
  count: number;
  line: LineNo;
};

