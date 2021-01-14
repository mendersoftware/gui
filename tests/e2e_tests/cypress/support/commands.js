import '@cypress/skip-test/support';
import 'cypress-file-upload';
import 'cypress-iframe';
import 'cypress-localstorage-commands';
import 'cypress-wait-until';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';
import jwtDecode from 'jwt-decode';

addMatchImageSnapshotCommand({ allowSizeMismatch: true });

Cypress.Commands.add('login', (user, pass, failOnStatusCode = true) => {
  const initializeTenant = token => {
    const userId = jwtDecode(token).sub;
    cy.setLocalStorage(`${userId}-onboarding`, JSON.stringify({ complete: true }));
    cy.setLocalStorage('onboardingComplete', 'true');
    cy.setCookie(`${userId}-onboarded`, 'true');
    cy.saveLocalStorage();
    cy.setCookie('JWT', token);
    Cypress.config('JWT', token);
  };

  const existingJwt = Cypress.config('JWT');
  if (existingJwt) {
    initializeTenant(existingJwt);
  }
  cy.request({
    method: 'POST',
    url: `${Cypress.config().baseUrl}api/management/v1/useradm/auth/login`,
    failOnStatusCode,
    headers: {
      Authorization: `Basic ${btoa(`${user}:${pass}`)}`,
      'Content-Type': 'application/json'
    }
  }).then(({ body }) => {
    initializeTenant(body);
  });
  cy.visit(`${Cypress.config().baseUrl}ui/`);
  cy.waitUntil(() => cy.getCookie('JWT').then(cookie => Boolean(cookie && cookie.value)));
});

Cypress.Commands.add('tenantTokenRetrieval', () => {
  cy.visit(`${Cypress.config().baseUrl}ui/#/settings/organization-and-billing`);
  cy.waitUntil(() => cy.get('.tenant-token-text').invoke('text'));
  cy.get('.tenant-token-text')
    .invoke('text')
    .then(token => cy.setCookie('tenantToken', token));
});
