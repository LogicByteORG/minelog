export type LineNo = number;

export type LogRecord = {
  line: LineNo;
  end: LineNo;
  thread: string;
  level: string;
  logger: string;
  message: string;
  prefix: string;
  chat: boolean;
};

export type Confidence = "high" | "medium";

export type Fact = {
  value: string;
  detail?: string;
  confidence: Confidence;
  lines: LineNo[];
  others: { value: string; lines: LineNo[] }[];
};

export type EnvironmentKey = "gameVersion" | "loader" | "java" | "launcher";

export type ModKind = "mod" | "plugin";

export type ModEntry = {
  kind: ModKind;
  name: string;
  id?: string;
  version?: string;
  line: LineNo;
};

export type Environment = {
  gameVersion?: Fact;
  loader?: Fact;
  java?: Fact;
  launcher?: Fact;
  conflicts: EnvironmentKey[];
  mods: ModEntry[];
  bundled: number;
};

