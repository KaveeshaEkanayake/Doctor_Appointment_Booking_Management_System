import request from "supertest";
import app     from "../app.js";
import prisma  from "../lib/prisma.js";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

const TEST_SUFFIX   = Date.now();
const DOCTOR_EMAIL  = `admin_test_doctor_${TEST_SUFFIX}@gmail.com`;

let adminToken;
let doctorId;

describe("Admin Doctor Management API", () => {

  beforeAll(async () => {
    // Login as admin
    const loginRes = await request(app)
  .post("/api/admin/login")
  .send({ email: "admin@dams.com", password: "Admin@1234" });

adminToken = loginRes.body.token;
console.log("Admin login response:", loginRes.body);
    // Create test doctor
    const doctor = await prisma.doctor.create({
      data: {
        firstName:      "Test",
        lastName:       "Doctor",
        email:          DOCTOR_EMAIL,
        password:       "hashedpassword",
        phone:          "0771234567",
        specialisation: "General Practice",
        status:         "PENDING",
        profileStatus:  "PENDING_REVIEW",
      },
    });

    doctorId = doctor.id;
  });

  afterAll(async () => {
    await prisma.adminLog.deleteMany({
      where: { target: { contains: `Doctor #${doctorId}` } },
    });
    await prisma.doctor.deleteMany({ where: { email: DOCTOR_EMAIL } });
    await prisma.$disconnect();
  });

  describe("GET /api/admin/doctors", () => {

    it("should return pending doctors", async () => {
      const res = await request(app)
        .get("/api/admin/doctors?status=PENDING")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.doctors)).toBe(true);
    });

    it("should return approved doctors", async () => {
      const res = await request(app)
        .get("/api/admin/doctors?status=APPROVED")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for invalid status", async () => {
      const res = await request(app)
        .get("/api/admin/doctors?status=INVALID")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/admin/doctors?status=PENDING");
      expect(res.status).toBe(401);
    });

  });

  describe("PATCH /api/admin/doctors/:id/status", () => {

    it("should approve a pending doctor", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "APPROVED" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.doctor.status).toBe("APPROVED");
    });

    it("should reject a doctor", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "REJECTED" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.doctor.status).toBe("REJECTED");
    });

    it("should return 400 for invalid status", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INVALID" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existent doctor", async () => {
      const res = await request(app)
        .patch("/api/admin/doctors/999999/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "APPROVED" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/status`)
        .send({ status: "APPROVED" });

      expect(res.status).toBe(401);
    });

  });

  describe("PATCH /api/admin/doctors/:id/suspend", () => {

    beforeAll(async () => {
      // Make sure doctor is APPROVED before suspend tests
      await prisma.doctor.update({
        where: { id: doctorId },
        data:  { status: "APPROVED" },
      });
    });

    it("should suspend an approved doctor", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/suspend`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("SUSPENDED");
    });

    it("should activate a suspended doctor", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/suspend`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("APPROVED");
    });

    it("should return 404 for non-existent doctor", async () => {
      const res = await request(app)
        .patch("/api/admin/doctors/999999/suspend")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/suspend`);

      expect(res.status).toBe(401);
    });

  });

  describe("DELETE /api/admin/doctors/:id", () => {

    it("should delete a doctor", async () => {
      // Create a doctor to delete
      const doctor = await prisma.doctor.create({
        data: {
          firstName:      "Delete",
          lastName:       "Me",
          email:          `delete_doctor_${TEST_SUFFIX}@gmail.com`,
          password:       "hashedpassword",
          phone:          "0771234568",
          specialisation: "General Practice",
          status:         "REJECTED",
          profileStatus:  "PENDING_REVIEW",
        },
      });

      const res = await request(app)
        .delete(`/api/admin/doctors/${doctor.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Doctor deleted successfully");
    });

    it("should return 404 for non-existent doctor", async () => {
      const res = await request(app)
        .delete("/api/admin/doctors/999999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .delete(`/api/admin/doctors/${doctorId}`);

      expect(res.status).toBe(401);
    });

  });

  describe("GET /api/admin/profiles", () => {

    it("should return pending review profiles", async () => {
      const res = await request(app)
        .get("/api/admin/profiles?profileStatus=PENDING_REVIEW")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.doctors)).toBe(true);
    });

    it("should return 400 for invalid profileStatus", async () => {
      const res = await request(app)
        .get("/api/admin/profiles?profileStatus=INVALID")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .get("/api/admin/profiles");

      expect(res.status).toBe(401);
    });

  });

  describe("PATCH /api/admin/doctors/:id/profileStatus", () => {

    it("should approve a doctor profile", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/profileStatus`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ profileStatus: "APPROVED" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.doctor.profileStatus).toBe("APPROVED");
    });

    it("should reject a doctor profile", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/profileStatus`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ profileStatus: "REJECTED" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.doctor.profileStatus).toBe("REJECTED");
    });

    it("should return 400 for invalid profileStatus", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/profileStatus`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ profileStatus: "INVALID" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .patch(`/api/admin/doctors/${doctorId}/profileStatus`)
        .send({ profileStatus: "APPROVED" });

      expect(res.status).toBe(401);
    });

  });

});