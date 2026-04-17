import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";

describe("Patient Password Reset", () => {
  const testEmail = "password_reset_test@gmail.com";
  let resetToken = null;

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Reset",
        lastName:  "Test",
        email:     testEmail,
        password:  "password123",
        phone:     "0501234567"
      });
  });

  afterAll(async () => {
    await prisma.patient.deleteMany({
      where: { email: testEmail }
    });
    await prisma.$disconnect();
  });

  // ── forgot-password ──────────────────────────────────────────
  describe("POST /api/auth/forgot-password", () => {

    it("should return 200 for registered email", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: testEmail });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 200 even for unregistered email (security)", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "notexist@gmail.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should set resetToken in database after request", async () => {
      await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: testEmail });

      const patient = await prisma.patient.findUnique({
        where: { email: testEmail }
      });

      expect(patient.resetToken).toBeDefined();
      expect(patient.resetTokenExpiry).toBeDefined();

      // Save token for reset tests
      resetToken = patient.resetToken;
    });

    it("should set token expiry to 1 hour from now", async () => {
      const patient = await prisma.patient.findUnique({
        where: { email: testEmail }
      });

      const now = new Date();
      const expiry = new Date(patient.resetTokenExpiry);
      const diffMs = expiry - now;
      const diffMins = diffMs / 1000 / 60;

      // Should be close to 60 minutes
      expect(diffMins).toBeGreaterThan(58);
      expect(diffMins).toBeLessThanOrEqual(60);
    });

  });

  // ── reset-password ───────────────────────────────────────────
  describe("POST /api/auth/reset-password", () => {

    it("should return 400 for missing token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ password: "newpassword123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for missing password", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "sometoken" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for password less than 8 characters", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: resetToken, password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "invalidtoken123", password: "newpassword123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for expired token", async () => {
      // Manually expire the token
      await prisma.patient.update({
        where: { email: testEmail },
        data: { resetTokenExpiry: new Date(Date.now() - 1000) }
      });

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: resetToken, password: "newpassword123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      // Restore valid token for next test
      await prisma.patient.update({
        where: { email: testEmail },
        data: { resetTokenExpiry: new Date(Date.now() + 3600000) }
      });
    });

    it("should reset password successfully with valid token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: resetToken, password: "newpassword123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Password reset successfully");
    });

    it("should clear resetToken after successful reset", async () => {
      const patient = await prisma.patient.findUnique({
        where: { email: testEmail }
      });

      expect(patient.resetToken).toBeNull();
      expect(patient.resetTokenExpiry).toBeNull();
    });

    it("should be able to login with new password after reset", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: "newpassword123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should not be able to login with old password after reset", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

  });

});