import '@cypress/skip-test/support';
import 'cypress-file-upload';
import 'cypress-iframe';
import 'cypress-localstorage-commands';
import 'cypress-wait-until';

Cypress.Commands.add('login', (user, pass, failOnStatusCode = true) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.config().baseUrl}api/management/v1/useradm/auth/login`,
    failOnStatusCode,
    headers: {
      Authorization: `Basic ${btoa(`${user}:${pass}`)}`,
      'Content-Type': 'application/json'
    }
  }).then(({ body }) => cy.setCookie('JWT', body));
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
