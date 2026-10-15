import type { Rule } from "../types";

const LEVEL = /Exception reading [^\n]{0,200}level\.dat/;
const DECODE = /Not in GZIP format|Unexpected end of ZLIB input stream/;
const WORLD_CONTEXT = /\.dat\b|\.mca\b|\.mcr\b|region|chunk|NBT|level|world|player/i;

export const worldDataCorrupt: Rule = {
  id: "world-data-corrupt",
  read(line, { head }) {
    const short = line.slice(0, 1000);
    const levelLine = LEVEL.test(short);
    const decode = DECODE.test(short);
    if (!levelLine && !decode) return null;
    if (decode && !levelLine && !WORLD_CONTEXT.test(`${head.slice(0, 400)} ${short}`)) return null;

    if (levelLine || /level\.dat/.test(head.slice(0, 400))) {
      return {
        key: "level",
        message: "The world's level.dat can't be read, so the file looks damaged.",
        solutions: [
          "Stop the server and copy the whole world folder somewhere safe before changing anything.",
          "Next to level.dat there is level.dat_old, a copy from the last save. Rename the broken level.dat to level.dat.broken, then rename level.dat_old to level.dat and start again.",
          "If that doesn't work, restore the world from your last backup.",
        ],
      };
    }

    return {
      key: "data",
      message: "A world file can't be unpacked, so it's damaged or was cut off while it was being saved.",
      solutions: [
        "Power loss or a server that was killed in the middle of a save is the usual cause. Copy the world folder somewhere safe first.",
        "If only a few chunks are damaged, a tool like Region Fixer or MCA Selector can remove or repair them.",
        "If the world won't load at all, restore it from your last backup.",
      ],
    };
  },
};
