import { validationResult } from "express-validator";

// This middleware checks if validation passed
// If not, it returns all errors immediately
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next(); // no errors? move on to the controller
};

export default validate;