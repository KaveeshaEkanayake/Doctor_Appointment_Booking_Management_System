import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";

describe("POST /api/auth/doctor/login", () => {

  beforeAll(async () => {
    // Create a test doctor for login tests
    await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName: "Login",
        lastName: "Doctor",
        email: "test_doctor_login@gmail.com",
        password: "password123",
        phone: "0501234567",
        specialisation: "Cardiology"
      });
  });

  afterAll(async () => {
    await prisma.doctor.deleteMany({
      where: { email: { startsWith: "test_" } }
    });
    await prisma.$disconnect();
  });

  it("should return 403 for pending doctor", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/login")
      .send({
        email: "test_doctor_login@gmail.com",
        password: "password123"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Your account is awaiting approval from the administrator");
  });

  it("should return 200 and token for approved doctor", async () => {
    // Approve the doctor directly in DB
    await prisma.doctor.update({
      where: { email: "test_doctor_login@gmail.com" },
      data: { status: "APPROVED" }
    });

    const res = await request(app)
      .post("/api/auth/doctor/login")
      .send({
        email: "test_doctor_login@gmail.com",
        password: "password123"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/login")
      .send({
        email: "test_doctor_login@gmail.com",
        password: "wrongpassword"
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/login")
      .send({
        email: "test_notexist@gmail.com",
        password: "password123"
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing password", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/login")
      .send({
        email: "test_doctor_login@gmail.com"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/login")
      .send({
        email: "notanemail",
        password: "password123"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

});