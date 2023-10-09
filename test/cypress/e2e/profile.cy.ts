describe('profile', () => {
  it('shows profile navigator', () => {
    cy.login()

    cy.get('[id="sign-in-button"]')
      .click()

    cy.contains('Create Trainer Profile')
      .click()

    cy.fixture('profile.json', ).then(profile => {
      profile.cities = [...profile.cities, "Broken Arrow"]

      cy.get('input[name="name"]')
        .type(profile.name)
        .get('input[name="cities"]')
        .type(`${profile.cities[0]}{enter}`)
        .get('input[name="cities"]')
        .type(`${profile.cities[1]}{enter}`)
        .get('input[name="goals"]')
        .type(`${profile.goals[0]}{enter}`)
        .get('input[name="goals"]')
        .type(`${profile.goals[1]}{enter}`)
        .get('button')
        .contains('Save')
        .click()
      
      cy.visit('/')
      
      cy.visit('/profiles/trainer')

      cy.get('input[name="name"]')
        .should('have.value', profile.name)
        .get('span')
        .contains(profile.cities[0])
        .get('span')
        .contains(profile.cities[1])
        .get('span')
        .contains(profile.goals[0])
        .get('span')
        .contains(profile.goals[1])
    })
  })
})