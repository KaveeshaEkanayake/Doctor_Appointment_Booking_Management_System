// Global Cypress support file
Cypress.on("uncaught:exception", (err) => {
  // Prevent Cypress from failing on app errors
  return false;
});