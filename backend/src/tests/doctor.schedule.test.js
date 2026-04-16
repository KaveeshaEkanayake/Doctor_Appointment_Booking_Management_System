import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

const TEST_RUN_SUFFIX = `${Date.now()}`;
const DOCTOR_EMAIL    = `schedule_test_doctor_${TEST_RUN_SUFFIX}@gmail.com`;
const PATIENT_EMAIL   = `schedule_test_patient_${TEST_RUN_SUFFIX}@gmail.com`;
let doctorToken;
let doctorId;
let patientId;
let blockId;

describe("Doctor Schedule API", () => {

  beforeAll(async () => {
    // Register and login doctor
    await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName:      "Schedule",
        lastName:       "Doctor",
        email:          DOCTOR_EMAIL,
        password:       "password123",
        phone:          "0771234567",
        specialisation: "General",
      });

    // Approve doctor directly in DB
    const doctor = await prisma.doctor.findUnique({ where: { email: DOCTOR_EMAIL } });
    doctorId = doctor.id;
    await prisma.doctor.update({
      where: { id: doctorId },
      data:  { status: "APPROVED" },
    });

    const loginRes = await request(app)
      .post("/api/auth/doctor/login")
      .send({ email: DOCTOR_EMAIL, password: "password123" });

    doctorToken = loginRes.body.token;

    // Register patient
    await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Schedule",
        lastName:  "Patient",
        email:     PATIENT_EMAIL,
        password:  "password123",
        phone:     "0771234568",
      });

    const patient = await prisma.patient.findUnique({ where: { email: PATIENT_EMAIL } });
    patientId = patient.id;
  });

  afterAll(async () => {
    await prisma.blockedSlot.deleteMany({ where: { doctorId } });
    await prisma.appointment.deleteMany({ where: { doctorId } });
    await prisma.availability.deleteMany({ where: { doctorId } });
    await prisma.doctor.deleteMany({ where: { email: DOCTOR_EMAIL } });
    await prisma.patient.deleteMany({ where: { email: PATIENT_EMAIL } });
    await prisma.$disconnect();
  });

  // GET /api/doctor/schedule
  describe("GET /api/doctor/schedule", () => {

    it("should return schedule successfully", async () => {
      const res = await request(app)
        .get("/api/doctor/schedule?startDate=2026-04-14&endDate=2026-04-20")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.appointments)).toBe(true);
      expect(Array.isArray(res.body.blockedSlots)).toBe(true);
    });

    it("should return 400 if startDate is missing", async () => {
      const res = await request(app)
        .get("/api/doctor/schedule?endDate=2026-04-20")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if endDate is missing", async () => {
      const res = await request(app)
        .get("/api/doctor/schedule?startDate=2026-04-14")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .get("/api/doctor/schedule?startDate=2026-04-14&endDate=2026-04-20");

      expect(res.status).toBe(401);
    });

    it("should return 403 if role is not doctor", async () => {
      const patientLoginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: PATIENT_EMAIL, password: "password123" });

      const patientToken = patientLoginRes.body.token;

      const res = await request(app)
        .get("/api/doctor/schedule?startDate=2026-04-14&endDate=2026-04-20")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });

  });

  // POST /api/doctor/schedule/block
  describe("POST /api/doctor/schedule/block", () => {

    it("should block a slot successfully", async () => {
      const res = await request(app)
        .post("/api/doctor/schedule/block")
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({
          date:      "2026-05-01",
          startTime: "09:00",
          endTime:   "10:00",
          reason:    "Lunch break",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.blockedSlot).toBeDefined();
      blockId = res.body.blockedSlot.id;
    });

    it("should return 400 if date is missing", async () => {
      const res = await request(app)
        .post("/api/doctor/schedule/block")
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ startTime: "09:00", endTime: "10:00", reason: "Lunch" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if reason is missing", async () => {
      const res = await request(app)
        .post("/api/doctor/schedule/block")
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ date: "2026-05-02", startTime: "09:00", endTime: "10:00" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 409 if slot already blocked", async () => {
      const res = await request(app)
        .post("/api/doctor/schedule/block")
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({
          date:      "2026-05-01",
          startTime: "09:00",
          endTime:   "10:00",
          reason:    "Duplicate block",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .post("/api/doctor/schedule/block")
        .send({ date: "2026-05-03", startTime: "09:00", endTime: "10:00", reason: "Test" });

      expect(res.status).toBe(401);
    });

  });

  // DELETE /api/doctor/schedule/block/:id
  describe("DELETE /api/doctor/schedule/block/:id", () => {

    it("should unblock a slot successfully", async () => {
      const res = await request(app)
        .delete(`/api/doctor/schedule/block/${blockId}`)
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Slot unblocked successfully");
    });

    it("should return 404 if block not found", async () => {
      const res = await request(app)
        .delete("/api/doctor/schedule/block/999999")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .delete("/api/doctor/schedule/block/abc")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .delete(`/api/doctor/schedule/block/1`);

      expect(res.status).toBe(401);
    });

  });

});