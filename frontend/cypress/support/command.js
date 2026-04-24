// Custom commands

Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add("adminLogin", () => {
  cy.visit("/admin/login");
  cy.get('input[type="email"]').type("admin@dams.com");
  cy.get('input[type="password"]').type("Admin@1234");
  cy.get('button[type="submit"]').click();
});