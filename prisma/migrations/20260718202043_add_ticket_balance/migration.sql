-- AlterTable
ALTER TABLE "users"
  ADD COLUMN "ticket_balance" INTEGER NOT NULL DEFAULT 15,
  ADD COLUMN "tickets_reset_at" TIMESTAMPTZ NOT NULL DEFAULT now();
