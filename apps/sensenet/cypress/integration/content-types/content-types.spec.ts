import { pathWithQueryParams } from '../../../src/services/query-string-builder'

describe('Content types', () => {
  before(() => {
    cy.login()
    cy.visit(pathWithQueryParams({ path: '/', newParams: { repoUrl: Cypress.env('repoUrl') } }))
      .get('[data-test="drawer-menu-item-content-types"]')
      .click()
  })

  it('clicking on the content types menu item should show article', () => {
    cy.get('.ReactVirtualized__Table__Grid').then((grid) => {
      let scroll = 0

      function timeout() {
        setTimeout(() => {
          scroll = scroll + 200
          grid.scrollTop(scroll)

          if (!grid.find('[data-test="table-cell-article"]').length) {
            timeout()
          }
        }, 100)
      }

      timeout()
    })

    cy.get('[data-test="table-cell-article"]').scrollIntoView().should('be.visible')
  })

  it('double clicking on article should open binary editor', () => {
    cy.get('[data-test="table-cell-article"]').dblclick({ force: true })
    cy.get('div').contains('Article').should('be.visible')
    cy.get('.monaco-editor').should('be.visible')
    cy.get('[data-test="monaco-editor-cancel"]').click()
  })
})
