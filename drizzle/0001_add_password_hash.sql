-- Migration to add password_hash column to users table
ALTER TABLE "users" ADD COLUMN "password_hash" varchar;