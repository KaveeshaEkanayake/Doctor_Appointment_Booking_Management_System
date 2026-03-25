import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title:       "DAMS — Doctor Appointment Booking API",
      version:     "1.0.0",
      description: "API documentation for the Doctor Appointment Booking Management System",
    },
    servers: [
      {
        url:         "http://localhost:5000",
        description: "Local Development",
      },
      {
        url:         "https://doctor-app-staging.up.railway.app",
        description: "Staging",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         "http",
          scheme:       "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);