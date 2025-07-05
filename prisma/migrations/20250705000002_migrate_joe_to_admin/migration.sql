-- Update any existing users with JOE role to ADMIN role
UPDATE "User" SET "role" = 'ADMIN' WHERE "role" = 'JOE';
