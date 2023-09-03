describe('login page', () => {
  it('shows signed out', () => {
    cy
      .visit('/')
      .contains('Sign in')
  })

  it('logs in', () => {
    const testUser = {
      email: 'test@example.com',
      name: 'tester',
      password: 'test-password',
    }

    cy.request({
      method: 'POST',
      url: `http://${Cypress.env('AUTH_URL')}:9096/signup`,
      body: JSON.stringify({ ...testUser }),
      failOnStatusCode: false,
    })

    cy.visit('/')

    cy.contains('Sign in')
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