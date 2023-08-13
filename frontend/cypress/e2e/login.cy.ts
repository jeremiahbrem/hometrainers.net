import jwt from 'jsonwebtoken'

describe('login page', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('shows signed out', () => {
    cy.visit('/auth-test')
    cy.contains('Sign in')
  })

  it('shows signed in', () => {
    const token = jwt.sign(
      JSON.stringify({
        token: {
          email: 'test@example.com',
          name: 'test guy'
        },
        account: {
          id_token: 'id-token',
          refresh_token: 'refresh-token',
          expires_in: 100000,
          provider: 'google'
        },
      }),
      Cypress.env('API_SECRET')!
      ,
    )

    cy
    .setCookie('next-auth.session-token', token)
    
   
      cy.visit('/auth-test')
      .contains('Signed in as')
  })
})