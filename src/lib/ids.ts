import { randomInt } from "node:crypto";

const LOWER = "abcdefghijkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const ALPHABET = LOWER + UPPER + DIGITS;
export const ID_LENGTH = 9;

const ID_PATTERN = /^[a-km-np-zA-HJ-KM-NP-Z2-9]{9}$/;
const HAS_LOWER = /[a-km-np-z]/;
const HAS_UPPER = /[A-HJ-KM-NP-Z]/;
const HAS_DIGIT = /[2-9]/;

const LEGACY_PATTERN = /^[a-km-np-z2-9]{8}$/;

export function createId(): string {
  for (;;) {
    let id = "";
    for (let i = 0; i < ID_LENGTH; i += 1) {
      id += ALPHABET[randomInt(ALPHABET.length)];
    }
    if (HAS_LOWER.test(id) && HAS_UPPER.test(id) && HAS_DIGIT.test(id)) {
      return id;
    }
  }
}

export function isValidId(value: string): boolean {
  if (LEGACY_PATTERN.test(value)) return true;
  return (
    ID_PATTERN.test(value) &&
    HAS_LOWER.test(value) &&
    HAS_UPPER.test(value) &&
    HAS_DIGIT.test(value)
  );
}

