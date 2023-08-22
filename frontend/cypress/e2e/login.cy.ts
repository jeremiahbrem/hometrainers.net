describe('login page', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('shows signed out', () => {
    cy
      .visit('/auth-test')
      .contains('Sign in')
  })

  it('logs in', () => {
    cy.visit('/auth-test')
      .contains('Sign in auth')
      .click()
      
    const email = 'john.doe@test.com'

    cy.get('input[name="username"')
      .type(email)
      .get('input[name="password"')
      .type("test password")
      .get('button')
      .click()
      
    cy.contains(`Signed in as ${email}`)
  })
})