import request from "supertest";
import { app, prisma } from "./setup";

describe("Authentication API", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: { email: "admin@example.com", password: "password123", name: "Admin", role: "admin" },
    });
  });

  it("should return a token on successful login", async () => {
    const res = await request((await app).server)
      .post("/login")
      .send({ email: "admin@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should return 401 on invalid credentials", async () => {
    const res = await request((await app).server)
      .post("/login")
      .send({ email: "admin@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });
});
