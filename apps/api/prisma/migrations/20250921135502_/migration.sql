/*
  Warnings:

  - Added the required column `salt` to the `wallets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `wallets` table without a default value. This is not possible if the table is not empty.
  - Made the column `encryptedMnemonic` on table `wallets` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "encryptedPrivateKey" TEXT NOT NULL,
    "encryptedMnemonic" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_wallets" ("address", "createdAt", "encryptedMnemonic", "encryptedPrivateKey", "id", "iv", "userId") SELECT "address", "createdAt", "encryptedMnemonic", "encryptedPrivateKey", "id", "iv", "userId" FROM "wallets";
DROP TABLE "wallets";
ALTER TABLE "new_wallets" RENAME TO "wallets";
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
