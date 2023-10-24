Cypress.config('defaultCommandTimeout', 20000);

describe('IconTextList', () => {
  it('adds IconTextList block', () => {
    cy.loginTrainer()

    cy.trainerProfile()

    cy.contains('My Page')
      .click()

    cy.setPageSettings()

    cy.contains('Add Block')
      .click()
      .get('[data-testid="icon-text-list-preview"]')
      .click()

    cy.contains('title +')
      .click()
      .get('.ProseMirror').eq(0)
      .type('Icons Text Title')
      .get('.close-editor').eq(0)
      .click()

    cy.contains('item +')
      .click()

    cy.get('[data-testid="icon-text-content"]').eq(0)
      .click()
      .get('.ProseMirror').eq(1)
      .type('Icon test text content')
      .get('.close-editor').eq(1)
      .click()

    cy.get('[data-testid="open-icon-picker"]').eq(0)
      .click()
      .get('input[name="icon-name"]').eq(0)
      .type('Health Metrics')

    const inputText = `${[...new Array(7).fill('{backspace}')].join('')}#dd940c`
    cy.get('.color-picker input').eq(1)
      .type(inputText)
      .get('[data-testid="update-icon"]').eq(0)
      .click()

    cy.saveChanges()

    cy.visit('/test-page-1')
      .reload()

    cy.contains('Icons Text Title')

    cy.contains('Icon test text content')

    cy.contains('health_metrics')
      .should('have.attr', 'style', 'color:#dd940c')

    cy.visit('/my-page')

    cy.get('[data-testid="alert-scrim"]')
      .click()
    
    cy.contains('Remove Block')
      .click()
    
    cy.saveChanges()
  })
})
