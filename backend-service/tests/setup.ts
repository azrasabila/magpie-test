import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { buildServer } from "../src/server";

config({ path: ".env.test" });

export const prisma = new PrismaClient();
export const app = buildServer();

beforeAll(async () => {
  execSync("npx prisma migrate deploy");
  (await app).ready();
});

afterAll(async () => {
  await prisma.$disconnect();
  (await app).close();
});
