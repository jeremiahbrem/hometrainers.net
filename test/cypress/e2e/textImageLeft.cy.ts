describe('TextImageLeft', () => {
  it('test', () => {
    cy.loginTrainer()

    cy.trainerProfile()

    cy.contains('My Page')
      .click()

    cy.get('[data-testid="alert-scrim"]')
      .click()
      .get('[id="open-settings"]')
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

    cy.contains('Save Changes')
      .click()

    cy.contains('Page updated')

    cy.visit('/test-page-1')
      .contains('My test content')

    cy.visit('/my-page')

    cy.get('[data-testid="alert-scrim"]')
      .click()
    
    cy.contains('Remove Block')
      .click()
    
    cy.contains('Save Changes')
      .click()
  })
})