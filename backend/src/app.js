import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://doctor-appointment-booki-git-cdacf1-kaveeshaekanayakes-projects.vercel.app'
  ],
  credentials: true
}));

// Allows app to read JSON from request body
app.use(express.json());

// All auth routes live under /api/auth
app.use("/api/auth", authRoutes);

export default app;