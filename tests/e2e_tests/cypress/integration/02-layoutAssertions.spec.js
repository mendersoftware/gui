import { onlyOn, skipOn } from '@cypress/skip-test';
/// <reference types="Cypress" />

context('Layout assertions', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.restoreLocalStorage();
    onlyOn('staging', () => {
      cy.tenantTokenRetrieval();
    });
    Cypress.Cookies.preserveOnce('JWT');
  });

  describe('Overall layout and structure', () => {
    it('shows the left navigation', () => {
      cy.get('.leftFixed.leftNav')
        .should('contain', 'Dashboard')
        .and('contain', 'Devices')
        .and('contain', 'Releases')
        .and('contain', 'Deployments')
        .and('be.visible')
        .end();
    });

    it('has clickable header buttons', () => {
      cy.get('a').contains('Dashboard').click().end();
      cy.get('a').contains('Devices').click().end();
      cy.get('a').contains('Releases').click().end();
      cy.get('a').contains('Deployments').click().end();
    });

    it('can authorize a device', () => {
      onlyOn('staging', () => {
        cy.getCookie('tenantToken').then(({ value: token }) => {
          cy.task('startDockerClient', { token, backend: Cypress.config().baseUrl, count: 1 });
        });
      });
      cy.get('a').contains('Devices').click().end();
      cy.get('a').contains('Pending').click().end();
      cy.get('.deviceListItem', { timeout: 60000 });
      cy.get('.deviceListItem input').click().end();
      cy.get('.MuiSpeedDial-fab').click();
      cy.get('#device-actions-actions').get('.MuiSpeedDialAction-staticTooltipLabel').contains('Accept').parent().find('button').click().end();
      cy.get('a').contains('Device groups').click();
      onlyOn('staging', () => cy.contains('.deviceListItem', 'original', { timeout: 60000 }));
      skipOn('staging', () => cy.contains('.deviceListItem', 'release', { timeout: 60000 }));
      cy.get('.deviceListItem').click();
    });

    it('can group a device', () => {
      cy.contains('a', 'Devices').click().end();
      cy.get('.deviceListItem input').click().end();
      cy.get('.MuiSpeedDial-fab').click();
      cy.get('#device-actions-actions')
        .contains('.MuiSpeedDialAction-staticTooltipLabel', /Add selected/i)
        .parent()
        .find('button')
        .click()
        .end();
      cy.get('#group-creation-selection', { timeout: 5000 }).type('testgroup');
      cy.get('.MuiDialogTitle-root').click();
      cy.contains('button', /create group/i).click();
      cy.contains('.grouplist', 'testgroup').should('be.be.visible');
    });
  });
});
