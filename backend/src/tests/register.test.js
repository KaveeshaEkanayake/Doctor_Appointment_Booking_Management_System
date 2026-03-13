import { describe, it, expect, afterEach } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

// Clean up test data after each test
// This deletes any patient created during testing
afterEach(async () => {
  await prisma.patient.deleteMany({
    where: {
      email: {
        contains: "test_",
      },
    },
  });
});

describe("Patient Registration - POST /api/auth/register", () => {

  // Test 1: Successful registration
  it("should register a patient successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "test_register@gmail.com",
        password: "password123",
        phone: "0501234567",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Patient registered successfully");
    expect(response.body.patient.email).toBe("test_register@gmail.com");
    // Make sure password is never returned
    expect(response.body.patient.password).toBeUndefined();
  });

  // Test 2: Duplicate email
  it("should return 409 if email already exists", async () => {
    // First register a patient
    await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "test_duplicate@gmail.com",
        password: "password123",
        phone: "0501234567",
      });

    // Try to register with same email again
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "test_duplicate@gmail.com",
        password: "password123",
        phone: "0501234567",
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Email already exists. Please use a different email."
    );
  });

  // Test 3: Weak password - no number
  it("should return 400 if password has no number", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "test_weakpass@gmail.com",
        password: "password",
        phone: "0501234567",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 4: Password too short
  it("should return 400 if password is less than 8 characters", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "test_shortpass@gmail.com",
        password: "pass1",
        phone: "0501234567",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 5: Missing fields
  it("should return 400 if required fields are missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test_missing@gmail.com",
        password: "password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 6: Invalid email format
  it("should return 400 if email format is invalid", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "notanemail",
        password: "password123",
        phone: "0501234567",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

});