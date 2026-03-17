import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let doctorToken;
let doctorId;

beforeAll(async () => {
  await prisma.doctor.deleteMany({
    where: { email: "availability-test@doctor.com" }
  });

  const hashedPassword = await bcrypt.hash("Test1234", 10);
  const doctor = await prisma.doctor.create({
    data: {
      firstName: "Avail",
      lastName: "Doctor",
      email: "availability-test@doctor.com",
      password: hashedPassword,
      phone: "0771234567",
      specialisation: "Cardiology",
      status: "APPROVED"
    }
  });

  doctorId = doctor.id;
  doctorToken = jwt.sign(
    { id: doctor.id, email: doctor.email, role: "doctor" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
});

afterAll(async () => {
  await prisma.availability.deleteMany({ where: { doctorId } });
  await prisma.doctor.deleteMany({
    where: { email: "availability-test@doctor.com" }
  });
  await prisma.$disconnect();
});

describe("GET /api/doctor/availability", () => {
  it("should return empty availability for new doctor", async () => {
    const res = await request(app)
      .get("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.availability).toEqual([]);
    expect(res.body.appointmentDuration).toBe(30);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/doctor/availability");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 403 with patient token", async () => {
    const patientToken = jwt.sign(
      { id: 999, email: "patient@test.com", role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = await request(app)
      .get("/api/doctor/availability")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
  });
});

describe("PUT /api/doctor/availability", () => {
  it("should save weekly availability", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        appointmentDuration: 30,
        availability: [
          { day: "MONDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "TUESDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "WEDNESDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "THURSDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "FRIDAY", startTime: "09:00", endTime: "15:00", isActive: true }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Availability updated successfully");
    expect(res.body.availability).toHaveLength(5);
    expect(res.body.appointmentDuration).toBe(30);
  });

  it("should support multiple slots per day", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        availability: [
          { day: "MONDAY", startTime: "09:00", endTime: "12:00", isActive: true },
          { day: "MONDAY", startTime: "14:00", endTime: "17:00", isActive: true }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.availability).toHaveLength(2);
    expect(res.body.availability[0].day).toBe("MONDAY");
    expect(res.body.availability[1].day).toBe("MONDAY");
  });

  it("should update appointment duration", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        appointmentDuration: 15
      });

    expect(res.status).toBe(200);
    expect(res.body.appointmentDuration).toBe(15);
  });

  it("should reject invalid appointment duration", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        appointmentDuration: 45
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid day", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        availability: [
          { day: "HOLIDAY", startTime: "09:00", endTime: "17:00" }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid time format", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        availability: [
          { day: "MONDAY", startTime: "9am", endTime: "5pm" }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject start time after end time", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        availability: [
          { day: "MONDAY", startTime: "17:00", endTime: "09:00" }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should replace old availability on update", async () => {
    // First save 5 days
    await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        availability: [
          { day: "MONDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "TUESDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "WEDNESDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "THURSDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "FRIDAY", startTime: "09:00", endTime: "15:00", isActive: true }
        ]
      });

    // Then update to only 2 days
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        availability: [
          { day: "MONDAY", startTime: "10:00", endTime: "14:00", isActive: true },
          { day: "FRIDAY", startTime: "10:00", endTime: "14:00", isActive: true }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.availability).toHaveLength(2);
  });

  it("should clear all availability when empty array sent", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        availability: []
      });

    expect(res.status).toBe(200);
    expect(res.body.availability).toHaveLength(0);
  });

  it("should return 401 without token", async () => {
    const res = await request(app)
      .put("/api/doctor/availability")
      .send({ appointmentDuration: 30 });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/doctors/:id/availability (public)", () => {
  beforeAll(async () => {
    // Set up availability for public test
    await request(app)
      .put("/api/doctor/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        appointmentDuration: 30,
        availability: [
          { day: "MONDAY", startTime: "09:00", endTime: "17:00", isActive: true },
          { day: "TUESDAY", startTime: "09:00", endTime: "17:00", isActive: false }
        ]
      });
  });

  it("should return only active slots for approved doctor", async () => {
    const res = await request(app).get(`/api/doctors/${doctorId}/availability`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.appointmentDuration).toBe(30);
    // Only active slots returned
    expect(res.body.availability).toHaveLength(1);
    expect(res.body.availability[0].day).toBe("MONDAY");
  });

  it("should return 404 for non-existent doctor", async () => {
    const res = await request(app).get("/api/doctors/99999/availability");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 for pending doctor", async () => {
    const hashedPassword = await bcrypt.hash("Test1234", 10);
    const pendingDoctor = await prisma.doctor.create({
      data: {
        firstName: "Pending",
        lastName: "Doc",
        email: "pending-avail@doctor.com",
        password: hashedPassword,
        phone: "0779999999",
        specialisation: "Dermatology",
        status: "PENDING"
      }
    });

    const res = await request(app).get(`/api/doctors/${pendingDoctor.id}/availability`);
    expect(res.status).toBe(404);

    await prisma.doctor.delete({ where: { id: pendingDoctor.id } });
  });

  it("should return 400 for invalid doctor ID", async () => {
    const res = await request(app).get("/api/doctors/abc/availability");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid doctor ID");
  });
});