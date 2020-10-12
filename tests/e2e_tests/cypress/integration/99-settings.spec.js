/// <reference types="Cypress" />

import jwtDecode from 'jwt-decode';

context('Settings', () => {
  before(() => {
    cy.clearCookies();
    cy.visit(`${Cypress.config().baseUrl}`);
    if (cy.contains('Log in').should('be.visible')) {
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

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('JWT', 'noExpiry');
  });

  describe('Basic setting features', () => {
    it('allows access to user management', () => {
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings`);
      cy.get('[href="/ui/#/settings/user-management"]').click();
      cy.contains('button', 'Create new user').should('be.visible');
    });
    it('allows email changes', () => {
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_email').click();
    });
    it('allows password changes', () => {
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_password').click();
      cy.get('[name=password]').should('be.empty');
      cy.contains('button', 'Generate').click();
      cy.get('[name=password]').invoke('val').should('not.be.empty');
      cy.get('[name=password]').clear().type('mysecretpassword!456');
      cy.get('.rightFluid').last().contains('button', 'Save').click();
      cy.contains('.header-dropdown', Cypress.env('username')).click({ force: true });
      cy.contains('span', 'Log out').click({ force: true });
    });

    it('allows password changes', () => {
      cy.visit(`${Cypress.config().baseUrl}`).wait(300);
      if (cy.contains('Log in').should('be.visible')) {
        cy.get('[id=email]').type(Cypress.env('username'));
        cy.get('[name=password]').type('mysecretpassword!456');
        cy.contains('button', 'Log in').click().wait(2000);
      }
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_password').click();
      cy.get('[name=password]').type(Cypress.env('password'));
      cy.get('[name=password]').clear().type(Cypress.env('password')).wait(300);
      cy.get('.rightFluid').last().contains('button', 'Save').click();
    });
  });
});
