declare namespace Cypress {
  interface Chainable<Subject = any> {
    loginTrainer(): Chainable<MyCustomType>
    trainerProfile(): Chainable<MyCustomType>
    setPageSettings(): Chainable<MyCustomType>
  }
}