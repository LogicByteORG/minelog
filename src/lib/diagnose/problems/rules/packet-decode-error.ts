import type { Rule } from "../types";

const LARGER = /was larger than I expected, found (\d+) bytes? extra/;
const COMPRESSED = /Badly compressed packet/;
const PAYLOAD = /Payload may not be larger than \d+ bytes/;

export const packetDecodeError: Rule = {
  id: "packet-decode-error",
  read(line) {
    const short = line.slice(0, 1000);

    if (LARGER.test(short)) {
      return {
        key: "extra",
        message: "A packet carried more data than the receiving side expected, which means the two sides don't speak quite the same version.",
        solutions: [
          "Make sure the client, the server and any proxy run versions that match, with the same loader on both sides if you use mods.",
          "If you use ViaVersion, ViaBackwards or ViaRewind, install them on the proxy or on the backend, not on both.",
          "Update plugins that rewrite packets, like ProtocolLib, packetevents and ViaVersion, to the newest build for your server version.",
        ],
      };
    }

    if (COMPRESSED.test(short)) {
      return {
        key: "compressed",
        message: "A packet was too big to send, so the player was disconnected.",
        solutions: [
          "It's usually one oversized thing near the player, like a book with a huge amount of text, a pile of full shulker boxes, or a block from a mod that stores a lot of data.",
          "Have the player join far from that spot, or remove the block or item with an admin account.",
          "If it started after adding a mod, update it or remove it and test again.",
        ],
      };
    }

    if (PAYLOAD.test(short)) {
      return {
        key: "payload",
        message: "A mod sent more custom data in one packet than the game allows.",
        solutions: [
          "Update the mods on both the client and the server. Mods that sync big lists or inventories usually fix this in a newer version.",
          "If it began after adding a mod, remove that one first and test again.",
        ],
      };
    }

    return null;
  },
};
