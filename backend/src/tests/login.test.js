import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";

describe("POST /api/auth/login", () => {

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Login",
        lastName: "Test",
        email: "login_test_unique@gmail.com",
        password: "password123",
        phone: "0501234567"
      });
  });

  afterAll(async () => {
    await prisma.patient.deleteMany({
      where: { email: "login_test_unique@gmail.com" }
    });
    await prisma.$disconnect();
  });

  it("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login_test_unique@gmail.com",
        password: "password123"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login_test_unique@gmail.com",
        password: "wrongpassword"
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "notexist@gmail.com",
        password: "password123"
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login_test_unique@gmail.com"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "notanemail",
        password: "password123"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        password: "password123"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

});