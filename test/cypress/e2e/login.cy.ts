describe('login page', () => {
  it('shows signed out', () => {
    cy
      .visit('/')
      .contains('Sign in')
  })

  it('logs in', () => {
    cy.loginTrainer()

    cy.contains('Sign out')
  })
})