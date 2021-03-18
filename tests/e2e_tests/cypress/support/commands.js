import '@cypress/skip-test/support';
import 'cypress-file-upload';
import 'cypress-iframe';
import 'cypress-localstorage-commands';
import 'cypress-wait-until';
import { addMatchImageSnapshotCommand } from 'mzedel-cypress-image-snapshot/command';
import jwtDecode from 'jwt-decode';

addMatchImageSnapshotCommand({ allowSizeMismatch: true });

Cypress.Commands.add('login', (user, pass, failOnStatusCode = true) => {
  const initializeTenant = token => {
    const userId = jwtDecode(token).sub;
    cy.setLocalStorage(`${userId}-onboarding`, JSON.stringify({ complete: true }));
    cy.setLocalStorage('onboardingComplete', 'true');
    cy.saveLocalStorage();
    Cypress.config('JWT', token);
    cy.setCookie(`${userId}-onboarded`, 'true');
    cy.setCookie('JWT', token);
  };

  const existingJwt = Cypress.config('JWT');
  if (existingJwt) {
    initializeTenant(existingJwt);
  } else {
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
  }
  cy.waitUntil(() => cy.getCookie('JWT').then(cookie => Boolean(cookie && cookie.value)));
  cy.visit(`${Cypress.config().baseUrl}ui/`);
});

Cypress.Commands.add('tenantTokenRetrieval', () => {
  cy.visit(`${Cypress.config().baseUrl}ui/#/settings/organization-and-billing`);
  cy.waitUntil(() => cy.get('.tenant-token-text').invoke('text'));
  cy.get('.tenant-token-text')
    .invoke('text')
    .then(token => cy.setCookie('tenantToken', token));
});

Cypress.Commands.add('downloadPng', (filename, selector) => {
  expect(filename).to.be.a('string');

  // the simplest way is to grab the data url and use
  // https://on.cypress.io/writefile to save PNG file
  return cy.get(selector).then($canvas => {
    const url = $canvas[0].toDataURL();
    const data = url.replace(/^data:image\/png;base64,/, '');
    cy.writeFile(filename, data, 'base64');
    cy.wrap(selector);
  });
});
