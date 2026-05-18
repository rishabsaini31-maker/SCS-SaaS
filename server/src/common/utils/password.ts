import crypto from "crypto";

const HASH_ALGORITHM = "sha512";
const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function makeHash(password: string, salt: string) {
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    HASH_ALGORITHM,
  );
  return derivedKey.toString("hex");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = makeHash(password, salt);
  return [`pbkdf2`, ITERATIONS, salt, hash].join("$");
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsText, salt, hash] = storedHash.split("$");
  if (
    algorithm !== "pbkdf2" ||
    !iterationsText ||
    !salt ||
    !hash ||
    Number.isNaN(Number(iterationsText))
  ) {
    return false;
  }

  const iterations = Number(iterationsText);
  const derivedHash = crypto.pbkdf2Sync(
    password,
    salt,
    iterations,
    KEY_LENGTH,
    HASH_ALGORITHM,
  );
  const storedBuffer = Buffer.from(hash, "hex");

  if (storedBuffer.length !== derivedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, derivedHash);
}
