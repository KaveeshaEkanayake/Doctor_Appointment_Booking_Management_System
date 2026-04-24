import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

const TEST_EMAIL = "delete_test_unique@gmail.com";
let token;

describe("DELETE /api/patient/account", () => {

  beforeAll(async () => {
    // Register a test patient
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Delete",
        lastName:  "Test",
        email:     TEST_EMAIL,
        password:  "password123",
        phone:     "0771234567"
      });

    // Login to get token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email:    TEST_EMAIL,
        password: "password123"
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Clean up in case test failed and patient still exists
    await prisma.patient.deleteMany({
      where: { email: TEST_EMAIL }
    });
    await prisma.$disconnect();
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .delete("/api/patient/account");

    expect(res.status).toBe(401);
  });

  it("should return 401 if token is invalid", async () => {
    const res = await request(app)
      .delete("/api/patient/account")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
  });

  it("should return 403 if role is not patient", async () => {
    const doctorToken = jwt.sign(
      { id: 999, email: "doctor@test.com", role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = await request(app)
      .delete("/api/patient/account")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(403);
  });

  it("should delete patient account successfully", async () => {
    const res = await request(app)
      .delete("/api/patient/account")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Account deleted successfully.");
  });

  it("should return 404 if patient already deleted", async () => {
    // Token is still valid but patient no longer exists in DB
    const res = await request(app)
      .delete("/api/patient/account")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Patient not found.");
  });

});