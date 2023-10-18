Cypress.config('defaultCommandTimeout', 25000);

describe('TextImageLeft', () => {
  it('test', () => {
    cy.loginTrainer()

    cy.trainerProfile()

    cy.contains('My Page')
      .click()
  
    cy.setPageSettings()

    cy.contains('Add Block')
      .click()
      .get('[data-testid="image-text-left-preview"]')
      .click()

    cy.contains('Click to add text +')
      .click()
      .get('.ProseMirror')
      .type('My test content')
      .get('[data-testid="image-text-content"]')
      .contains('test')
    
    cy.contains('close')
      .click()

    cy.contains('Background')
      .click()
    
    const inputText = `${[...new Array(7).fill('{backspace}')].join('')}#dd940c`
    cy.get('.color-picker input').eq(1)
      .type(inputText)

    cy.contains('Close')
      .click()

    cy.contains('Save Changes')
      .click()
      .get('[data-testid="alert-scrim"]')
      .click()

    cy.visit('/test-page-1')
      .reload()
      
    cy.contains('My test content')
      .get('[data-testid="image-text-section"]')
      .should('have.attr', 'style', 'background-color:#dd940c')

    cy.visit('/my-page')

    cy.get('[data-testid="alert-scrim"]')
      .click()
    
    cy.contains('Remove Block')
      .click()
    
    cy.contains('Save Changes')
      .click()
      .get('[data-testid="alert-scrim"]')
      .click()
  })
})