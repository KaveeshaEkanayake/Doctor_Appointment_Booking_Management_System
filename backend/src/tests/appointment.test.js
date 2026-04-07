import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app     from "../app.js";
import prisma  from "../lib/prisma.js";
import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";

let patientToken;
let doctorToken;
let patientId;
let doctorId;

beforeAll(async () => {
  // Create test patient
  const hashedPassword = await bcrypt.hash("Test@1234", 10);
  const patient = await prisma.patient.create({
    data: {
      firstName: "Test",
      lastName:  "Patient",
      email:     "testpatient@appointment.com",
      password:  hashedPassword,
      phone:     "0771234567",
    },
  });
  patientId    = patient.id;
  patientToken = jwt.sign(
    { id: patient.id, email: patient.email, role: "patient" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Create test doctor
  const doctor = await prisma.doctor.create({
    data: {
      firstName:      "Test",
      lastName:       "Doctor",
      email:          "testdoctor@appointment.com",
      password:       hashedPassword,
      phone:          "0771234568",
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
});

afterAll(async () => {
  await prisma.appointment.deleteMany({
    where: { patientId }
  });
  await prisma.patient.deleteMany({
    where: { email: "testpatient@appointment.com" }
  });
  await prisma.doctor.deleteMany({
    where: { email: "testdoctor@appointment.com" }
  });
  await prisma.$disconnect();
});

describe("GET /api/appointments/booked-slots/:doctorId/:date", () => {

  it("should return empty array when no appointments booked", async () => {
    const res = await request(app)
      .get(`/api/appointments/booked-slots/${doctorId}/2026-12-01`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bookedSlots).toEqual([]);
  });

  it("should return booked slots for a specific date", async () => {
    // Create a test appointment
    await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-12-01T00:00:00.000Z"),
        time:   "10:00 AM",
        status: "PENDING",
      },
    });

    const res = await request(app)
      .get(`/api/appointments/booked-slots/${doctorId}/2026-12-01`);

    expect(res.status).toBe(200);
    expect(res.body.bookedSlots).toContain("10:00 AM");
  });

  it("should not return cancelled appointment slots", async () => {
    await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-12-01T00:00:00.000Z"),
        time:   "11:00 AM",
        status: "CANCELLED",
      },
    });

    const res = await request(app)
      .get(`/api/appointments/booked-slots/${doctorId}/2026-12-01`);

    expect(res.status).toBe(200);
    expect(res.body.bookedSlots).not.toContain("11:00 AM");
  });

  it("should be publicly accessible without token", async () => {
    const res = await request(app)
      .get(`/api/appointments/booked-slots/${doctorId}/2026-12-01`);

    expect(res.status).toBe(200);
  });

});

describe("POST /api/appointments", () => {

  it("should create appointment successfully", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        date:   "2026-12-02T00:00:00.000Z",
        time:   "09:00 AM",
        reason: "General checkup",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.appointment).toBeDefined();
    expect(res.body.appointment.time).toBe("09:00 AM");
  });

  it("should return 409 when slot is already booked", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        date:   "2026-12-02T00:00:00.000Z",
        time:   "09:00 AM",
        reason: "Duplicate booking",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("This time slot is already booked");
  });

  it("should return 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({
        doctorId,
        date:   "2026-12-03T00:00:00.000Z",
        time:   "10:00 AM",
        reason: "Test",
      });

    expect(res.status).toBe(401);
  });

  it("should return 403 when doctor tries to book", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        doctorId,
        date:   "2026-12-03T00:00:00.000Z",
        time:   "10:00 AM",
        reason: "Test",
      });

    expect(res.status).toBe(403);
  });

  it("should return 400 when doctorId is missing", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        date:   "2026-12-03T00:00:00.000Z",
        time:   "10:00 AM",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 when date is missing", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        time: "10:00 AM",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 when time is missing", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        date: "2026-12-03T00:00:00.000Z",
      });

    expect(res.status).toBe(400);
  });

  it("should create appointment without reason", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        date: "2026-12-04T00:00:00.000Z",
        time: "09:00 AM",
      });

    expect(res.status).toBe(201);
    expect(res.body.appointment.time).toBe("09:00 AM");
  });

  it("should include doctor info in response", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId,
        date:   "2026-12-05T00:00:00.000Z",
        time:   "09:00 AM",
        reason: "Follow up",
      });

    expect(res.status).toBe(201);
    expect(res.body.appointment.doctor).toBeDefined();
    expect(res.body.appointment.doctor.firstName).toBe("Test");
    expect(res.body.appointment.doctor.lastName).toBe("Doctor");
  });

});

describe("GET /api/appointments/my", () => {

  it("should return patient appointments", async () => {
    const res = await request(app)
      .get("/api/appointments/my")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.appointments)).toBe(true);
  });

  it("should return formatted appointment with doctorName", async () => {
    const res = await request(app)
      .get("/api/appointments/my")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.appointments[0].doctorName).toBeDefined();
    expect(res.body.appointments[0].doctorName).toContain("Dr.");
  });

  it("should return appointment with correct fields", async () => {
    const res = await request(app)
      .get("/api/appointments/my")
      .set("Authorization", `Bearer ${patientToken}`);

    const appt = res.body.appointments[0];
    expect(appt.id).toBeDefined();
    expect(appt.date).toBeDefined();
    expect(appt.time).toBeDefined();
    expect(appt.status).toBeDefined();
  });

  it("should return 401 when not authenticated", async () => {
    const res = await request(app)
      .get("/api/appointments/my");

    expect(res.status).toBe(401);
  });

  it("should return 403 when doctor tries to access", async () => {
    const res = await request(app)
      .get("/api/appointments/my")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(403);
  });

  it("should return status in capitalized format", async () => {
    const res = await request(app)
      .get("/api/appointments/my")
      .set("Authorization", `Bearer ${patientToken}`);

    const appt = res.body.appointments[0];
    expect(appt.status).toBe("Pending");
  });
  describe("PATCH /api/appointments/:id/reschedule", () => {
  let appointmentId;

  beforeAll(async () => {
    // Create a future appointment to reschedule
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-12-10T00:00:00.000Z"),
        time:   "09:00 AM",
        status: "PENDING",
      },
    });
    appointmentId = appointment.id;
  });

  it("should reschedule a pending appointment successfully", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        date: "2026-12-20",
        time: "10:00 AM",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("rescheduled successfully");
    expect(res.body.appointment.time).toBe("10:00 AM");
    expect(res.body.appointment.status).toBe("PENDING");
  });

  it("should reschedule a confirmed appointment successfully", async () => {
    // Set appointment to CONFIRMED first
    await prisma.appointment.update({
      where: { id: appointmentId },
      data:  { status: "CONFIRMED" },
    });

    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        date: "2026-12-21",
        time: "11:00 AM",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.appointment.status).toBe("PENDING");
  });

  it("should reset status to PENDING after reschedule", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        date: "2026-12-22",
        time: "09:00 AM",
      });

    expect(res.status).toBe(200);
    expect(res.body.appointment.status).toBe("PENDING");
  });

  it("should return 400 when trying to reschedule a cancelled appointment", async () => {
    // Create a cancelled appointment
    const cancelled = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-12-15T00:00:00.000Z"),
        time:   "02:00 PM",
        status: "CANCELLED",
      },
    });

    const res = await request(app)
      .patch(`/api/appointments/${cancelled.id}/reschedule`)
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        date: "2026-12-25",
        time: "10:00 AM",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 409 when new slot is already booked", async () => {
    // Create a conflicting appointment
    await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date:   new Date("2026-12-23T00:00:00.000Z"),
        time:   "03:00 PM",
        status: "PENDING",
      },
    });

    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        date: "2026-12-23",
        time: "03:00 PM",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("This time slot is already booked");
  });

  it("should return 404 when appointment does not belong to patient", async () => {
    // Create another patient
    const hashedPassword = await bcrypt.hash("Test@1234", 10);
    const otherPatient = await prisma.patient.create({
      data: {
        firstName: "Other",
        lastName:  "Patient",
        email:     "otherpatient@reschedule.com",
        password:  hashedPassword,
        phone:     "0779999999",
      },
    });
    const otherToken = jwt.sign(
      { id: otherPatient.id, email: otherPatient.email, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        date: "2026-12-24",
        time: "10:00 AM",
      });

    expect(res.status).toBe(404);

    await prisma.patient.delete({ where: { email: "otherpatient@reschedule.com" } });
  });

  it("should return 400 when date is missing", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ time: "10:00 AM" });

    expect(res.status).toBe(400);
  });

  it("should return 400 when time is missing", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ date: "2026-12-24" });

    expect(res.status).toBe(400);
  });

  it("should return 401 when not authenticated", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .send({
        date: "2026-12-24",
        time: "10:00 AM",
      });

    expect(res.status).toBe(401);
  });

  it("should return 403 when doctor tries to reschedule", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        date: "2026-12-24",
        time: "10:00 AM",
      });

    expect(res.status).toBe(403);
  });

  it("should return 400 for invalid appointment ID", async () => {
    const res = await request(app)
      .patch("/api/appointments/invalid/reschedule")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        date: "2026-12-24",
        time: "10:00 AM",
      });

    expect(res.status).toBe(400);
  });
});

});