import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import { describe, it, expect, afterEach, afterAll } from "@jest/globals";

describe("POST /api/auth/doctor/register", () => {

  afterEach(async () => {
    await prisma.doctor.deleteMany({
      where: { email: { startsWith: "test_" } }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a doctor successfully with status PENDING", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName: "John",
        lastName: "Smith",
        email: "test_doctor@gmail.com",
        password: "password123",
        phone: "0501234567",
        specialisation: "Cardiology"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.doctor.status).toBe("PENDING");
    expect(res.body.doctor.email).toBe("test_doctor@gmail.com");
    expect(res.body.doctor.specialisation).toBe("Cardiology");
  });

  it("should return 409 for duplicate email", async () => {
    await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName: "John",
        lastName: "Smith",
        email: "test_doctor_dup@gmail.com",
        password: "password123",
        phone: "0501234567",
        specialisation: "Cardiology"
      });

    const res = await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName: "John",
        lastName: "Smith",
        email: "test_doctor_dup@gmail.com",
        password: "password123",
        phone: "0501234567",
        specialisation: "Cardiology"
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email already exists");
  });

  it("should return 400 for weak password", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName: "John",
        lastName: "Smith",
        email: "test_doctor_weak@gmail.com",
        password: "weak",
        phone: "0501234567",
        specialisation: "Cardiology"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing specialisation", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName: "John",
        lastName: "Smith",
        email: "test_doctor_nospec@gmail.com",
        password: "password123",
        phone: "0501234567"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/register")
      .send({
        email: "test_doctor_missing@gmail.com"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/doctor/register")
      .send({
        firstName: "John",
        lastName: "Smith",
        email: "notanemail",
        password: "password123",
        phone: "0501234567",
        specialisation: "Cardiology"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

});