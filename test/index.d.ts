declare namespace Cypress {
  interface Chainable<Subject = any> {
    loginTrainer(): Chainable<MyCustomType>;
    createTrainerProfile(): Chainable<MyCustomType>;
  }
}