import request from "supertest";
import app     from "../app.js";
import prisma  from "../lib/prisma.js";
import bcrypt from "bcryptjs"; 

describe("Admin Login - POST /api/admin/login", () => {
  const testAdmin = {
    email:     "testadmin_login@dams.com",
    password:  "Admin@1234",
    firstName: "Test",
    lastName:  "Admin",
  };

  beforeAll(async () => {
    const hashed = await bcrypt.hash(testAdmin.password, 10);
    await prisma.admin.upsert({
      where:  { email: testAdmin.email },
      update: { password: hashed },
      create: { ...testAdmin, password: hashed },
    });
  });

  afterAll(async () => {
    await prisma.admin.deleteMany({ where: { email: testAdmin.email } });
    await prisma.$disconnect();
  });

  it("✅ logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: testAdmin.email, password: testAdmin.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.admin.role).toBe("admin");
  });

  it("✅ JWT payload contains role: admin", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: testAdmin.email, password: testAdmin.password });

    const payload = JSON.parse(
      Buffer.from(res.body.token.split(".")[1], "base64").toString()
    );
    expect(payload.role).toBe("admin");
  });

  it("❌ returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: testAdmin.email, password: "WrongPass@99" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("❌ returns 401 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: "ghost@dams.com", password: "Admin@1234" });

    expect(res.status).toBe(401);
  });

  it("❌ returns 400 for missing email", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ password: "Admin@1234" });

    expect(res.status).toBe(400);
  });

  it("❌ returns 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: "not-an-email", password: "Admin@1234" });

    expect(res.status).toBe(400);
  });
});