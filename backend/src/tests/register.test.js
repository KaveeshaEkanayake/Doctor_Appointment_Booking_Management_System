import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import { describe, it, expect, afterEach, afterAll } from "@jest/globals";

describe("POST /api/auth/register", () => {

  afterEach(async () => {
    await prisma.patient.deleteMany({
      where: { email: { startsWith: "test_" } }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a patient successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "test_register@gmail.com",
        password: "password123",
        phone: "0501234567"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.patient.email).toBe("test_register@gmail.com");
  });

  it("should return 409 for duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "test_dup@gmail.com",
        password: "password123",
        phone: "0501234567"
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "test_dup@gmail.com",
        password: "password123",
        phone: "0501234567"
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "test_weak@gmail.com",
        password: "weak",
        phone: "0501234567"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "test_short@gmail.com",
        password: "pass1",
        phone: "0501234567"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test_missing@gmail.com"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "notanemail",
        password: "password123",
        phone: "0501234567"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

});