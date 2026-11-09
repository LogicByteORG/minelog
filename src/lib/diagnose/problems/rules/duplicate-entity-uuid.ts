import type { Rule } from "../types";

const PATTERN =
  /Trying to add entity with duplicated UUID|UUID of added entity already mapped|Duplicate entity UUID|Keeping entity .{1,80} that already exists with UUID/i;

export const duplicateEntityUuid: Rule = {
  id: "duplicate-entity-uuid",
  read(line) {
    if (!PATTERN.test(line.slice(0, 600))) return null;
    return {
      key: "uuid",
      message: "Two entities in the world have the same UUID, so the server dropped one of them.",
      solutions: [
        "This usually comes from copied chunks or regions, a pasted schematic with entities, or a mob-cloning mod or plugin. Check what you did to that area recently.",
        "The server keeps one entity and removes the other, so nothing needs fixing if it only shows up once. If it repeats on every start, remove the duplicates with a tool like MCA Selector or a /kill on that area.",
        "Back up the world before editing region files by hand.",
      ],
    };
  },
};
