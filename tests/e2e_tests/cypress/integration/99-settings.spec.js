/// <reference types="Cypress" />

var jwtDecode = require('jwt-decode');

context('Settings', () => {
  before(() => {
    cy.clearCookies();
    cy.visit(`${Cypress.config().baseUrl}`);
    if (cy.location('hash').then(hash => hash === '#/login')) {
      // enter valid username and password
      cy.get('[id=email]').type(Cypress.env('username'));
      cy.get('[name=password]').type('mysecretpassword!123');
      cy.contains('button', 'Log in')
        .click()
        .wait(2000)
        .then(() =>
          cy.getCookie('JWT').then(cookie => {
            const userId = jwtDecode(cookie.value).sub;
            localStorage.setItem(`${userId}-onboarding`, JSON.stringify({ complete: true }));
            cy.visit('/');
          })
        );
    }
    Cypress.Cookies.preserveOnce('JWT', 'noExpiry');
  });

  describe('Basic setting features', () => {
    it('allows email changes', () => {
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_email').click();
    });
    it('allows password changes', () => {
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_password').click();
      cy.get('[name=password]').should('be.empty');
      cy.contains('button', 'Generate').click();
      cy.get('[name=password]')
        .invoke('val')
        .should('not.be.empty');
      cy.get('[name=password]')
        .clear()
        .type('mysecretpassword!456');
      cy.get('.rightFluid')
        .last()
        .contains('button', 'Save')
        .click();
      cy.contains('.header-dropdown', Cypress.env('username')).click({ force: true });
      cy.contains('span', 'Log out').click({ force: true });
      cy.location('hash').should('equal', '#/login');
      cy.get('[id=email]').type(Cypress.env('username'));
      cy.get('[name=password]').type('mysecretpassword!456');
      cy.contains('button', 'Log in')
        .click()
        .wait(2000);
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_password').click();
      cy.get('[name=password]').type(Cypress.env('password'));
      cy.get('.rightFluid')
        .last()
        .contains('button', 'Save')
        .click();
    });
  });
});
