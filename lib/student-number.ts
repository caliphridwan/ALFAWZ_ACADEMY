import "server-only";
import { randomInt } from "crypto";
import { prisma } from "@/lib/db/prisma";

// No 0/O/1/I/L so a number read off a card can't be mistyped.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const STUDENT_NUMBER_PATTERN = /^AFZ-S-[A-Z0-9]{6}$/;

function generate() {
  let code = "";
  for (let i = 0; i < 6; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `AFZ-S-${code}`;
}

/** Returns the student's ID number, creating it the first time it's needed. */
export async function ensureStudentNumber(userId: string): Promise<string> {
  const read = () =>
    prisma.user.findUnique({ where: { id: userId }, select: { studentNumber: true } });

  const existing = await read();
  if (existing?.studentNumber) return existing.studentNumber;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // Only fills it in if still empty, so two tabs opening at once can't swap the number.
      await prisma.user.updateMany({
        where: { id: userId, studentNumber: null },
        data: { studentNumber: generate() },
      });
      const now = await read();
      if (now?.studentNumber) return now.studentNumber;
    } catch (err) {
      if ((err as { code?: string }).code !== "P2002") throw err; // 2002 = number already taken: try another
    }
  }
  throw new Error("Could not assign a student number.");
}
