import { requiredJava } from "../../java-versions";
import type { Rule } from "../types";

const NEEDED = /class file version (\d+)(?:\.\d+)?\)/;
const RUNNING = /only recognizes class file versions up to (\d+)(?:\.\d+)?/;
const OLD = /Unsupported major\.minor version (\d+)(?:\.\d+)?/;

const javaOf = (classVersion: string) => Number(classVersion) - 44;

export const javaVersion: Rule = {
  id: "java-version",
  read(line, { environment }) {
    if (!line.includes("UnsupportedClassVersionError") && !line.includes("Unsupported major.minor")) {
      return null;
    }

    const modern = NEEDED.exec(line);
    const needed = modern ?? OLD.exec(line);
    if (!needed) return null;
    const running = modern ? RUNNING.exec(line) : null;

    const neededJava = javaOf(needed[1]);
    const runningJava = running ? javaOf(running[1]) : null;

    const solutions = [`Run it with Java ${neededJava} or newer.`];
    const game = environment.gameVersion?.value;
    const gameNeeds = game ? requiredJava(game) : null;
    if (game && gameNeeds !== null) {
      solutions.push(`Minecraft ${game} itself needs Java ${gameNeeds} or newer.`);
    }
    solutions.push(
      "In your launcher, pick that Java in the instance settings. On a server, start it with the full path to that Java, or choose it on your hosting panel.",
    );

    return {
      key: `${neededJava}/${runningJava ?? "?"}`,
      message: runningJava
        ? `Something needs Java ${neededJava}, but the game is running on Java ${runningJava}.`
        : `Something needs Java ${neededJava}, but the game is running on an older Java.`,
      solutions,
    };
  },
};

