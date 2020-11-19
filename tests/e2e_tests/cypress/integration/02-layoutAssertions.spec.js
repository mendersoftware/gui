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
          cy.task('startClient', { token, backend: Cypress.config().baseUrl, count: 1 });
        });
      });
      skipOn('staging', () => cy.task('startClient', { backend: Cypress.config().baseUrl, count: 1 }));
      cy.get('a').contains('Devices').click().end();
      cy.get('a').contains('Pending').click().end();
      cy.get('.deviceListItem', { timeout: 60000 });
      cy.get('.deviceListItem input').click().end();
      cy.get('.MuiSpeedDial-fab').click();
      cy.get('#device-actions-actions').get('.MuiSpeedDialAction-staticTooltipLabel').contains('Accept').parent().find('button').click().end();
      cy.get('a').contains('Device groups').click();
    });

    it('has basic inventory', () => {
      cy.get('a').contains('Devices').click();
      cy.contains('.deviceListItem', 'release', { timeout: 10000 });
      cy.get('.deviceListItem').click().should('contain', 'release').end();
      cy.get('.expandedDevice')
        .should('contain', `${Cypress.config('demoDeviceName') || 'release-v1'}`)
        .and('contain', 'Linux')
        .and('contain', 'mac')
        .and('contain', 'qemux86-64');
    });
  });
});
