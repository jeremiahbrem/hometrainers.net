describe('login page', () => {
  it('shows signed out', () => {
    cy
      .visit('/')
      .contains('Sign in')
  })

  it('logs in', () => {
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'test-password',
    }

    cy.visit('/')

    cy.get('[id="sign-in-button"]')
      .click()

    cy.contains('Sign in with email')
      .click()
      .get('input[name="email"')
      .type(testUser.email)
      .get('input[name="password"')
      .type(testUser.password)
      .get('button')
      .contains('Login')
      .click()

    cy.contains('Sign out')
  })
})