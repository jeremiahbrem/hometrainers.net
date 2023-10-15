describe('profile', () => {
  it('creates profile', () => {
    cy.loginTrainer()

    cy.contains('Create Trainer Profile')
      .click()

    cy.fixture('profile.json', ).then(profile => {
      profile.cities = [...profile.cities, "Broken Arrow"]

      cy.createTrainerProfile()
      
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