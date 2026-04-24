describe("Patient Flow", () => {

  const patientLogin = () => {
  cy.visit("/login");
  cy.contains("Patient").click({ force: true });
  cy.get('input[type="email"]', { timeout: 10000 }).type("kaveeshaekanayake702@gmail.com");
  cy.get('input[type="password"]').type("Password@1234");
  cy.contains("Log in").click({ force: true });
  cy.url({ timeout: 10000 }).should("include", "/patient/dashboard");
};

  it("should load the home page", () => {
    cy.visit("/");
    cy.contains("MediCare").should("exist");
  });

  it("should navigate to login page", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
  });

  it("should show error on invalid patient login", () => {
  cy.visit("/login");
  cy.contains("Patient").click({ force: true });
  cy.get('input[type="email"]').type("invalid@email.com");
  cy.get('input[type="password"]').type("wrongpassword");
  cy.contains("Log in").click({ force: true });
  cy.url().should("include", "/login");
});

  it("should navigate to register page", () => {
    cy.visit("/register");
    cy.contains(/register|sign up|create account/i).should("exist");
  });

  it("should login as patient and go to dashboard", () => {
    patientLogin();
  });

  it("should show patient dashboard after login", () => {
    patientLogin();
    cy.contains(/dashboard|welcome|appointments/i).should("exist");
  });

  it("should show appointments link in sidebar", () => {
    patientLogin();
    cy.contains(/appointment/i).should("exist");
  });

  it("should navigate to doctors page", () => {
    cy.visit("/doctors");
    cy.contains(/doctor|specialist/i).should("exist");
  });

  it("should show symptom checker page", () => {
    cy.visit("/symptom-checker");
    cy.contains(/symptom|feeling/i).should("exist");
  });

  it("should logout successfully", () => {
    patientLogin();
    cy.contains(/logout/i).click();
    cy.url().should("include", "/login");
  });
  it("should book an appointment end to end", () => {
  patientLogin();
  cy.visit("/doctors/38");
  // Select first available time slot
  cy.contains("09:00 AM").click({ force: true });
  // Click Confirm & Book Appointment
  cy.contains("Confirm & Book Appointment").click({ force: true });
  // Should be on review page
  cy.url({ timeout: 10000 }).should("include", "/appointments/review");
  // Add reason
  cy.get("textarea").type("Regular checkup", { force: true });
  // Confirm booking
  cy.contains("Confirm Booking").click({ force: true });
  // Should see confirmation
  cy.url({ timeout: 10000 }).should("include", "/appointments/confirmation");
  cy.contains("Appointment Booked Successfully!").should("exist");
});

});