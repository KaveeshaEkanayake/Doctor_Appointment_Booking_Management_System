import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app     from "../app.js";
import prisma  from "../lib/prisma.js";
import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";

let doctorToken;
let patientToken;
let doctorId;
let patientId;
let appointmentId;

beforeAll(async () => {
  const hashed = await bcrypt.hash("Test@1234", 10);

  const doctor = await prisma.doctor.create({
    data: {
      firstName:      "Test",
      lastName:       "Doctor",
      email:          "testdoctor@docappt.com",
      password:       hashed,
      phone:          "0771234567",
      specialisation: "Cardiology",
      status:         "APPROVED",
      profileStatus:  "APPROVED",
    },
  });
  doctorId    = doctor.id;
  doctorToken = jwt.sign(
    { id: doctor.id, email: doctor.email, role: "doctor" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const patient = await prisma.patient.create({
    data: {
      firstName: "Test",
      lastName:  "Patient",
      email:     "testpatient@docappt.com",
      password:  hashed,
      phone:     "0771234568",
    },
  });
  patientId    = patient.id;
  patientToken = jwt.sign(
    { id: patient.id, email: patient.email, role: "patient" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const appt = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      date:   new Date("2026-12-10T00:00:00.000Z"),
      time:   "09:00 AM",
      reason: "General checkup",
      status: "PENDING",
    },
  });
  appointmentId = appt.id;
});

afterAll(async () => {
  await prisma.appointment.deleteMany({
    where: { OR: [{ patientId }, { doctorId }] }
  });
  await prisma.doctor.deleteMany({
    where: { email: "testdoctor@docappt.com" }
  });
  await prisma.patient.deleteMany({
    where: { email: "testpatient@docappt.com" }
  });
  await prisma.$disconnect();
});

describe("GET /api/doctor/appointments", () => {

  it("should return doctor appointments when authenticated", async () => {
    const res = await request(app)
      .get("/api/doctor/appointments")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.appointments)).toBe(true);
  });

  it("should return appointment with patient name", async () => {
    const res = await request(app)
      .get("/api/doctor/appointments")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.appointments[0].patientName).toBeDefined();
    expect(res.body.appointments[0].patientName).toContain("Test");
  });

  it("should return appointment with date, time and reason", async () => {
    const res = await request(app)
      .get("/api/doctor/appointments")
      .set("Authorization", `Bearer ${doctorToken}`);

    const appt = res.body.appointments[0];
    expect(appt.date).toBeDefined();
    expect(appt.time).toBe("09:00 AM");
    expect(appt.reason).toBe("General checkup");
  });

  it("should return 401 when not authenticated", async () => {
    const res = await request(app)
      .get("/api/doctor/appointments");

    expect(res.status).toBe(401);
  });

  it("should return 403 when patient tries to access", async () => {
    const res = await request(app)
      .get("/api/doctor/appointments")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
  });

  it("should return appointments sorted by date", async () => {
    const res = await request(app)
      .get("/api/doctor/appointments")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    const dates = res.body.appointments.map(a => new Date(a.date));
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] >= dates[i - 1]).toBe(true);
    }
  });

});

describe("PATCH /api/doctor/appointments/:id/status", () => {

  it("should confirm a pending appointment", async () => {
    const res = await request(app)
      .patch(`/api/doctor/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.appointment.status).toBe("CONFIRMED");
  });

  it("should return 400 when trying to update already confirmed appointment", async () => {
    const res = await request(app)
      .patch(`/api/doctor/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Only pending appointments can be updated");
  });

  it("should reject appointment with reason", async () => {
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-12-11T00:00:00.000Z"),
        time:   "10:00 AM",
        status: "PENDING",
      },
    });

    const res = await request(app)
      .patch(`/api/doctor/appointments/${appt.id}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        status:          "CANCELLED",
        rejectionReason: "Doctor unavailable on this day",
      });

    expect(res.status).toBe(200);
    expect(res.body.appointment.status).toBe("CANCELLED");
    expect(res.body.appointment.rejectionReason).toBe("Doctor unavailable on this day");
  });

  it("should return 400 when rejecting without reason", async () => {
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-12-12T00:00:00.000Z"),
        time:   "11:00 AM",
        status: "PENDING",
      },
    });

    const res = await request(app)
      .patch(`/api/doctor/appointments/${appt.id}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "CANCELLED" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Rejection reason is required when cancelling");
  });

  it("should return 400 for invalid status", async () => {
    const res = await request(app)
      .patch(`/api/doctor/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "INVALID" });

    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid appointment ID", async () => {
    const res = await request(app)
      .patch("/api/doctor/appointments/abc/status")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid appointment ID");
  });

  it("should return 401 when not authenticated", async () => {
    const res = await request(app)
      .patch(`/api/doctor/appointments/${appointmentId}/status`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(401);
  });

  it("should return 403 when patient tries to update", async () => {
    const res = await request(app)
      .patch(`/api/doctor/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(403);
  });

  it("should return 404 when appointment not found", async () => {
    const res = await request(app)
      .patch("/api/doctor/appointments/99999/status")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(404);
  });

  it("should make rejected slot available again for rebooking", async () => {
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-12-15T00:00:00.000Z"),
        time:   "02:00 PM",
        status: "PENDING",
      },
    });

    // Reject the appointment
    await request(app)
      .patch(`/api/doctor/appointments/${appt.id}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        status:          "CANCELLED",
        rejectionReason: "Not available",
      });

    // Verify slot not in booked slots
    const slotsRes = await request(app)
      .get(`/api/appointments/booked-slots/${doctorId}/2026-12-15`);
    expect(slotsRes.body.bookedSlots).not.toContain("02:00 PM");

    // Verify slot can be rebooked
    const rebookRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        date:   "2026-12-15",
        time:   "02:00 PM",
        reason: "Rebook after cancellation",
      });

    expect(rebookRes.status).toBe(201);
    expect(rebookRes.body.appointment).toBeDefined();
  });

});