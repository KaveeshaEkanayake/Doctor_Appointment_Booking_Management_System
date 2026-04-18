import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

const TEST_RUN_SUFFIX = `${Date.now()}`;
const DOCTOR_EMAIL    = `payment_test_doctor_${TEST_RUN_SUFFIX}@gmail.com`;
const PATIENT_EMAIL   = `payment_test_patient_${TEST_RUN_SUFFIX}@gmail.com`;

let doctorId;
let patientId;
let patientToken;
let appointmentId;

describe("Payment API", () => {

  beforeAll(async () => {
    // Register doctor
    await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName:      "Payment",
        lastName:       "Doctor",
        email:          DOCTOR_EMAIL,
        password:       "password123",
        phone:          "0771234567",
        specialisation: "General",
      });

    const doctor = await prisma.doctor.findUnique({ where: { email: DOCTOR_EMAIL } });
    doctorId = doctor.id;

    // Approve doctor
    await prisma.doctor.update({
      where: { id: doctorId },
      data:  { status: "APPROVED", profileStatus: "APPROVED", consultationFee: 2500 },
    });

    // Register patient
    await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Payment",
        lastName:  "Patient",
        email:     PATIENT_EMAIL,
        password:  "password123",
        phone:     "0771234568",
      });

    const patient = await prisma.patient.findUnique({ where: { email: PATIENT_EMAIL } });
    patientId = patient.id;

    // Login patient
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: PATIENT_EMAIL, password: "password123" });

    patientToken = loginRes.body.token;

    // Create confirmed appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-05-01T00:00:00.000Z"),
        time:   "10:00 AM",
        status: "CONFIRMED",
      },
    });

    appointmentId = appointment.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { patientId } });
    await prisma.appointment.deleteMany({ where: { patientId } });
    await prisma.availability.deleteMany({ where: { doctorId } });
    await prisma.doctor.deleteMany({ where: { email: DOCTOR_EMAIL } });
    await prisma.patient.deleteMany({ where: { email: PATIENT_EMAIL } });
    await prisma.$disconnect();
  });

  describe("POST /api/payments", () => {

    it("should make a payment successfully", async () => {
      const res = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          appointmentId,
          cardName:   "John Smith",
          cardNumber: "1234567890123456",
          expiry:     "12/27",
          cvv:        "123",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Payment successful");
      expect(res.body.payment.cardLast4).toBe("3456");
      expect(res.body.payment.status).toBe("SUCCESS");
      expect(res.body.payment.amount).toBe(2500);
    });

  it("should return 400 if payment already made", async () => {
  const res = await request(app)
    .post("/api/payments")
    .set("Authorization", `Bearer ${patientToken}`)
    .send({
      appointmentId,
      cardName:   "John Smith",
      cardNumber: "1234567890123456",
      expiry:     "12/27",
      cvv:        "123",
    });

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});

    it("should return 400 if card number is invalid", async () => {
      const res = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          appointmentId,
          cardName:   "John Smith",
          cardNumber: "1234",
          expiry:     "12/27",
          cvv:        "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if expiry format is invalid", async () => {
      const res = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          appointmentId,
          cardName:   "John Smith",
          cardNumber: "1234567890123456",
          expiry:     "1227",
          cvv:        "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if CVV is invalid", async () => {
      const res = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          appointmentId,
          cardName:   "John Smith",
          cardNumber: "1234567890123456",
          expiry:     "12/27",
          cvv:        "12",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ appointmentId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .post("/api/payments")
        .send({
          appointmentId,
          cardName:   "John Smith",
          cardNumber: "1234567890123456",
          expiry:     "12/27",
          cvv:        "123",
        });

      expect(res.status).toBe(401);
    });

    it("should return 404 if appointment not found", async () => {
      const res = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          appointmentId: 999999,
          cardName:      "John Smith",
          cardNumber:    "1234567890123456",
          expiry:        "12/27",
          cvv:           "123",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

  });

  describe("GET /api/payments/appointment/:appointmentId", () => {

    it("should get payment by appointment id", async () => {
      const res = await request(app)
        .get(`/api/payments/appointment/${appointmentId}`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.payment).toBeDefined();
      expect(res.body.payment.appointmentId).toBe(appointmentId);
    });

    it("should return 404 if payment not found", async () => {
      const res = await request(app)
        .get("/api/payments/appointment/999999")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .get(`/api/payments/appointment/${appointmentId}`);

      expect(res.status).toBe(401);
    });

  });

});