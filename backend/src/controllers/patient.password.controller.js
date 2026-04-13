import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../lib/email.js";

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const patient = await prisma.patient.findUnique({
      where: { email }
    });

    // Always return success even if email not found (security)
    if (!patient) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered you will receive a reset link"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to DB
    await prisma.patient.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    // Build reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/forgot-password/reset?token=${resetToken}`;

    // Send email
    await sendEmail({
      to: email,
      subject: "MediCare — Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Reset Your Password</h2>
          <p>Hi ${patient.firstName},</p>
          <p>We received a request to reset your MediCare password.</p>
          <p>Click the button below to reset your password. 
             This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #2563eb; color: white; 
                    padding: 12px 24px; border-radius: 8px; text-decoration: none; 
                    font-weight: bold; margin: 16px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>The MediCare Team</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: "If this email is registered you will receive a reset link"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: "Token and password are required"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters"
    });
  }

  try {
    // Find patient with valid non-expired token
    const patient = await prisma.patient.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear token
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};