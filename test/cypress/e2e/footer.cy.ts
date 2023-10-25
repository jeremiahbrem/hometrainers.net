Cypress.config('defaultCommandTimeout', 20000);

describe('header', () => {
  it('adds Block Footer', () => {
    cy.loginTrainer()

    cy.trainerProfile()

    cy.contains('My Page')
      .click()

    cy.setPageSettings()

    cy.contains('Add Block')
      .click()
      .get('[data-testid="image-text-left-preview"]')
      .click()

    cy.contains('Add Block')
      .click()
      .get('[data-testid="footer-preview"]')
      .click()

    cy.contains('Add link +')
      .click()

    cy.get('input[name="label"]')
      .type('About')
    
    cy.get('input[name="block"]')
      .click()
    
    cy.contains('1 Image Text Left')
      .click()

    cy.get('[data-testid="update-page-links-button"]')
      .click()

    cy.contains('Copyright +')
      .click()
      .get('.ProseMirror').eq(1)
      .type('HomeTrainers.net')
      .get('.close-editor').eq(1)
      .click()

    cy.saveChanges()

    cy.visit('/test-page-1')
      .reload()

    cy.contains('About')
      .should('have.attr', 'href')
      .should('contain', '#about')

    cy.get('[id="about"]')

    cy.contains('©2023 HomeTrainers.net')

    cy.visit('/my-page')

    cy.get('[data-testid="alert-scrim"]')
      .click()
    
    cy.contains('Remove Block')
      .click()
    cy.contains('Remove Block')
      .click()
    
    cy.saveChanges()
  })
})
