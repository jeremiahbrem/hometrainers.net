declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<MyCustomType>;
  }
}