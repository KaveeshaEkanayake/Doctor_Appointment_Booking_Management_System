import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";

// Use a unique email that won't be deleted by register tests
const TEST_EMAIL = "login_test_unique@gmail.com";
const TEST_PASSWORD = "password123";

// Create test patient before all login tests
beforeAll(async () => {
  // Clean up first
  await prisma.patient.deleteMany({
    where: { email: TEST_EMAIL },
  });

  // Register a fresh test patient and store response
  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Login",
      lastName: "Test",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      phone: "0501234567",
    });

});

// Clean up after all login tests finish
afterAll(async () => {
  await prisma.patient.deleteMany({
    where: { email: TEST_EMAIL },
  });
});

describe("Patient Login - POST /api/auth/login", () => {

  // Test 1: Successful login
  it("should login successfully with correct credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
      

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBeDefined();
    expect(response.body.patient.email).toBe(TEST_EMAIL);
    expect(response.body.patient.password).toBeUndefined();
  });

  // Test 2: Wrong password
  it("should return 401 with wrong password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: "wrongpassword1",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid credentials. Please check your email and password."
    );
  });

  // Test 3: Email doesn't exist
  it("should return 401 if email does not exist", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "notexist@gmail.com",
        password: "password123",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid credentials. Please check your email and password."
    );
  });

  // Test 4: Missing password
  it("should return 400 if password is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 5: Invalid email format
  it("should return 400 if email format is invalid", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "notanemail",
        password: "password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 6: Missing email
  it("should return 400 if email is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        password: "password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

});