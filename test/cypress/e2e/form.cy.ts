Cypress.config('defaultCommandTimeout', 20000);

describe('Form', () => {
  it('sets input and button colors', () => {
    cy.loginTrainer()

    cy.trainerProfile()

    cy.contains('My Page')
      .click()
  
    cy.setPageSettings()

    cy.contains('Add Block')
      .click()
      .get('[data-testid="contact-form-preview"]')
      .click()

    cy.contains('title +')
      .click()

    cy.get('.ProseMirror').eq(0)
      .type('Contact Us')

    cy.contains('close').eq(0)
      .click()

    const colorInputText = `${[...new Array(7).fill('{backspace}')].join('')}#f6f6f6`
    cy.get('input[name="email"]').eq(0)
      .click()

    cy.get('.color-picker input').eq(1)
      .type(colorInputText)
      .get('.input-color-close')
      .click()

    const buttonColorText = `${[...new Array(7).fill('{backspace}')].join('')}#faf9f9`
    cy.get('[data-testid="block-button"]').eq(0)
      .click()
      .get('.color-picker input').eq(2)
      .type(buttonColorText)

    const buttonBackgroundText = `${[...new Array(7).fill('{backspace}')].join('')}#dd940c`
    cy.contains('text / background')
      .click()
      .get('.color-picker input').eq(2)
      .type(buttonBackgroundText)
      .get('input[name="block-button"]')
      .type('Submit')
      .get('.edit-button-close')
      .click()

    cy.saveChanges()

    cy.visit('/test-page-1')
      .reload()
      
    cy.contains('Contact Us')
      .get('input').eq(0)
      .should('have.attr', 'style')
      .should('include', 'background:#f6f6f6')
      .get('[data-testid="block-button"] button')
      .should('have.attr', 'style')
      .and('include', 'background-color:#dd940c')
      .and('include', 'color:#faf9f9')

    cy.visit('/my-page')

    cy.get('[data-testid="alert-scrim"]')
      .click()
    
    cy.contains('Remove Block')
      .click()
    
    cy.saveChanges()
  })
})