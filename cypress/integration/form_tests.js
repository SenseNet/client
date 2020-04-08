const userName = 'builtin\\admin'
const password = 'admin'
const repository = 'https://netfw-dev.service.sn.hu/'

const loginNameText = 'testuser'
const fullNameText = 'Test Test'
const emailText = 'test@test.com'
const passwordText = 'testpassword'

const usersAndGroupsTitle = 'Users and groups'

const modifiedFullNameText = 'Test User'

describe('Test forms', () => {
  beforeEach(() => {
    cy.login(userName, password, repository)
  })

  afterEach(() => {
    cy.logout()
  })

  it('creates a new user', () => {
    const user = 'User'

    cy.xpath('/html/body/div[1]/div/div/div[1]/div/ul/div/a[3]/div').click()

    cy.xpath('/html/body/div[1]/div/div/div[2]/div/div[1]/span').as('usersAndGroupsTitle')

    cy.get('@usersAndGroupsTitle').contains(usersAndGroupsTitle)

    cy.xpath('/html/body/div[1]/div/div/div[1]/div/ul/div/div[2]/div/span/button').click()

    cy.xpath('/html/body/div[2]/div[3]/ul')
      .children()
      .as('addButtonList')

    cy.get('@addButtonList').should('have.length', 4)

    cy.get('@addButtonList')
      .first()
      .find('.MuiListItemText-root')
      .children('span')
      .as('newUserButton')
      .contains(user)

    cy.get('@newUserButton').click()

    cy.get('#LoginName')
      .type(loginNameText)
      .should('have.value', loginNameText)

    cy.get('#FullName')
      .type(fullNameText)
      .should('have.value', fullNameText)

    cy.get('#Email')
      .type(emailText)
      .should('have.value', emailText)

    cy.get('#Password').type(passwordText)

    cy.contains('Submit').click()

    cy.get('.ReactVirtualized__Grid__innerScrollContainer')
      .children()
      .last()
      .as('newUser')

    cy.get('@newUser')
      .children()
      .eq(1)
      .children('div')
      .children('div')
      .children('div')
      .contains(fullNameText)

    cy.get('.MuiIconButton-colorInherit').click()
  })

  it('edits the name of new user', () => {
    cy.xpath('/html/body/div[1]/div/div/div[1]/div/ul/div/a[3]/div').click()

    cy.xpath('/html/body/div[1]/div/div/div[2]/div/div[1]/span').as('usersAndGroupsTitle')

    cy.get('@usersAndGroupsTitle').contains(usersAndGroupsTitle)

    cy.get('.ReactVirtualized__Grid__innerScrollContainer')
      .children()
      .last()
      .as('newUser')

    cy.get('@newUser').rightclick()

    cy.get('.MuiPopover-root div ul')
      .children()
      .should('have.length', 8)

    cy.get('.MuiPopover-root div ul')
      .children('li')
      .children('div')
      .contains('Edit')
      .click()

    cy.get('#FullName')
      .clear()
      .type(modifiedFullNameText)
      .should('have.value', modifiedFullNameText)

    cy.contains('Submit').click()

    cy.get('.ReactVirtualized__Grid__innerScrollContainer')
      .children()
      .last()
      .as('newUser')

    cy.get('@newUser')
      .children()
      .eq(1)
      .children('div')
      .children('div')
      .children('div')
      .contains(modifiedFullNameText)

    cy.get('.MuiIconButton-colorInherit').click()
  })

  it('checks browse of new user', () => {
    cy.xpath('/html/body/div[1]/div/div/div[1]/div/ul/div/a[3]/div').click()

    cy.xpath('/html/body/div[1]/div/div/div[2]/div/div[1]/span').as('usersAndGroupsTitle')

    cy.get('@usersAndGroupsTitle').contains(usersAndGroupsTitle)

    cy.get('.ReactVirtualized__Grid__innerScrollContainer')
      .children()
      .last()
      .as('newUser')

    cy.get('@newUser').rightclick()

    cy.get('.MuiPopover-root div ul')
      .children()
      .should('have.length', 8)

    cy.get('.MuiPopover-root div ul')
      .children('li')
      .children('div')
      .contains('Browse')
      .click()

    cy.contains('Full name')
      .parent()
      .children('p')
      .contains(modifiedFullNameText)

    cy.contains('Cancel').click()
  })

  it('deletes newly created user', () => {
    cy.xpath('/html/body/div[1]/div/div/div[1]/div/ul/div/a[3]/div').click()

    cy.xpath('/html/body/div[1]/div/div/div[2]/div/div[1]/span').as('usersAndGroupsTitle')

    cy.get('@usersAndGroupsTitle').contains(usersAndGroupsTitle)

    cy.get('.ReactVirtualized__Grid__innerScrollContainer')
      .children()
      .last()
      .as('newUser')

    cy.get('@newUser').rightclick()

    cy.get('.MuiPopover-root div ul')
      .children()
      .should('have.length', 8)

    cy.get('.MuiPopover-root div ul')
      .children('li')
      .children('div')
      .contains('Delete')
      .click()

    cy.xpath('/html/body/div[2]/div[3]/div/div/div[3]/div/button[2]').click()
  })
})
