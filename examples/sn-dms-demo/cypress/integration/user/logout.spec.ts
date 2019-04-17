context('Logout', () => {
  beforeEach(() => {
    cy.login('businesscat@sensenet.com', 'businesscat')
  })

  it('should navigate to login page', () => {
    cy.contains('Document library').should('exist')
    cy.get('[aria-owns="actionmenu"] > .material-icons').click()
    cy.get('[title="Log out"]').click()
    cy.url().should('include', '/login')
  })
})
