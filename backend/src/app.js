import express from "express";
import patientRoutes from "./routes/auth.routes.js";

const app = express();

// Allows app to read JSON from request body
app.use(express.json());

// All patient routes live under /api/patients
app.use("/api/auth", patientRoutes);

export default app;