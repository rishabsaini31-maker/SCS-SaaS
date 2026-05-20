import { Prisma } from "@prisma/client";
import prisma from "./prisma";

type PrismaKnownError = {
  code?: string;
  meta?: {
    target?: unknown;
  };
};

function isRetryableTransactionError(error: unknown) {
  const knownError = error as PrismaKnownError | undefined;
  if (!knownError?.code) {
    return false;
  }

  return knownError.code === "P2002" || knownError.code === "P2034";
}

export async function runSerializableTransaction<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>,
  options: {
    maxAttempts?: number;
    retryDelayMs?: number;
  } = {},
): Promise<T> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 50);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (attempt >= maxAttempts || !isRetryableTransactionError(error)) {
        throw error;
      }

      if (retryDelayMs > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelayMs * attempt),
        );
      }
    }
  }

  throw new Error("Transaction failed after retry attempts");
}
