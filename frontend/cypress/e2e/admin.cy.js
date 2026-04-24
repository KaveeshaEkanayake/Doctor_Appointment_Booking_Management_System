describe("Admin Flow", () => {

  const adminLogin = () => {
    cy.visit("/admin/login");
    cy.get('input[type="email"]', { timeout: 10000 }).type("admin@dams.com");
    cy.get('input[type="password"]').type("Admin@1234");
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should("include", "/admin/dashboard");
  };

  it("should load admin login page", () => {
    cy.visit("/admin/login");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
  });

  it("should show error on invalid admin login", () => {
  cy.visit("/admin/login");
  cy.get('input[type="email"]').type("invalid@admin.com");
  cy.get('input[type="password"]').type("wrongpassword");
  cy.get('button[type="submit"]').click();
  // Stay on login page means error occurred
  cy.url().should("include", "/admin/login");
});

  it("should login as admin and go to dashboard", () => {
    adminLogin();
  });

  it("should show admin dashboard after login", () => {
    adminLogin();
    cy.contains(/dashboard|doctor|management/i).should("exist");
  });

  it("should show sidebar with Doctors and Patients links", () => {
    adminLogin();
    cy.contains("Doctors").should("exist");
    cy.contains("Patients").should("exist");
  });

  it("should navigate to doctor management page", () => {
    adminLogin();
    cy.contains("Doctors").click();
    cy.url().should("include", "/admin/doctors");
  });

  it("should navigate to patient management page", () => {
    adminLogin();
    cy.contains("Patients").click();
    cy.url().should("include", "/admin/patients");
  });

  it("should show doctor list on doctor management page", () => {
    adminLogin();
    cy.contains("Doctors").click();
    cy.url().should("include", "/admin/doctors");
    cy.contains(/doctor management/i).should("exist");
  });

  it("should show patient list on patient management page", () => {
    adminLogin();
    cy.contains("Patients").click();
    cy.url().should("include", "/admin/patients");
    cy.contains(/patient management/i).should("exist");
  });

  it("should logout successfully", () => {
    adminLogin();
    cy.contains(/logout/i).click();
    cy.url().should("include", "/admin/login");
  });

});