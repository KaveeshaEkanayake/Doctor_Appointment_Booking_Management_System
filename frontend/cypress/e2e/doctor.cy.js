describe("Doctor Flow", () => {

 const doctorLogin = () => {
  cy.visit("/login");
  cy.contains("Doctor").click();
  cy.get('input[type="email"]', { timeout: 10000 }).type("kaveeshaekanayake536@gmail.com");
  cy.get('input[type="password"]').type("password1234");
  cy.contains("Log in").click();
  cy.url({ timeout: 10000 }).should("include", "/doctor/dashboard");
};

  it("should load login page", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
  });

  it("should show error on invalid doctor login", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').type("invaliddoctor@email.com");
    cy.get('input[type="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();
    cy.get("body").should("contain.text", "Invalid");
  });

  it("should login as doctor and go to dashboard", () => {
    doctorLogin();
  });

  it("should show doctor dashboard after login", () => {
    doctorLogin();
    cy.contains(/dashboard|appointments/i).should("exist");
  });

  it("should show sidebar navigation after doctor login", () => {
    doctorLogin();
    cy.contains(/appointments/i).should("exist");
    cy.contains(/profile/i).should("exist");
  });

  it("should navigate to doctor appointments page", () => {
    doctorLogin();
    cy.visit("/doctor/appointments");
    cy.url().should("include", "/doctor/appointments");
  });

  it("should navigate to doctor profile page", () => {
    doctorLogin();
    cy.visit("/doctor/profile");
    cy.url().should("include", "/doctor/profile");
  });

  it("should navigate to doctor schedule page", () => {
    doctorLogin();
    cy.visit("/doctor/schedule");
    cy.url().should("include", "/doctor/schedule");
  });

  it("should logout successfully", () => {
    doctorLogin();
    cy.contains(/logout/i).click();
    cy.url().should("include", "/login");
  });

});