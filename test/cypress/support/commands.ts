/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<any>;
  }
}

export function registerCommands() {
  Cypress.Commands.add('loginTrainer', () => {
    cy.fixture('user.json').then(user => {
      cy.visit('/')
  
      cy.get('[id="sign-in-button"]')
        .click()
    
      cy.contains('Sign in with email')
        .click()
        .get('input[name="email"]')
        .type(user.email)
        .get('input[name="password"]')
        .type(user.password)
        .get('button')
        .contains('Login')
        .click()
    })
  })
  Cypress.Commands.add('trainerProfile', () => {
    cy.fixture('profile.json', ).then(profile => {
      profile.cities = [...profile.cities, 'Broken Arrow']

      cy.visit('/profiles')

      cy.get('[id="login-checked"]')
        .get('[data-testid="loading"]')
        .should('have.attr', 'data-open', 'false')
        .get('[data-testid="profile-modal"]')
        .should('have.attr', 'style', 'left: -110vw;')
        .get('body').then($body => {
          if ($body.text().includes('Create Trainer Profile')) {
            cy.contains('Create Trainer Profile')
            .click()

            cy.get('input[name="name"]')
              .type(profile.name)
              .get('input[name="cities"]')
              .type(`${profile.cities[0]}{enter}`)
              .get('input[name="cities"]')
              .type(`${profile.cities[1]}{enter}`)
              .get('input[name="goals"]')
              .type(`${profile.goals[0]}{enter}`)
              .get('input[name="goals"]')
              .type(`${profile.goals[1]}{enter}`)
              .get('button')
              .contains('Save')
              .click()
              .get('[data-testid="alert-scrim"]')
              .click()
          }
        })
    })
  })
  Cypress.Commands.add('setPageSettings', () => {
    cy.get('[data-testid="alert-scrim"]')
      .click()
    
    cy.get('[id="open-settings"]')
      .click()

    cy.get('input[name="active"]').then($active => {
      if(!$active.is(':checked')) {
        cy.get('input[name="slug"]')
        .type('test-page-1')
        .get('input[name="title"]')
        .type('Test Title')
        .get('input[name="description"]')
        .type('Test Description')
        .get('[data-testid="active-switch"]')
        .click()
      }
    })

    cy.get('[id="open-settings"]')
    .click()
  })
}
