import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Allows app to read JSON from request body
app.use(express.json());

// All auth routes live under /api/auth
app.use("/api/auth", authRoutes);

export default app;