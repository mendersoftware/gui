/// <reference types="Cypress" />
import { onlyOn, skipOn } from '@cypress/skip-test';
import jwtDecode from 'jwt-decode';

context('Login', () => {
  describe('works as expected', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.visit(`${Cypress.config().baseUrl}ui/`);
    });

    it('Logs in using UI', () => {
      cy.visit(`${Cypress.config().baseUrl}ui/`);
      // enter valid username and password
      cy.get('[id=email]').clear().type(Cypress.env('username'));
      cy.get('[name=password]').clear().type(Cypress.env('password'));
      cy.contains('button', 'Log in').click();
      // confirm we have logged in successfully
      cy.waitUntil(() => cy.getCookie('JWT').then(cookie => Boolean(cookie && cookie.value)));
      cy.getCookie('JWT').then(cookie => {
        const userId = jwtDecode(cookie.value).sub;
        cy.setLocalStorage(`${userId}-onboarding`, JSON.stringify({ complete: true }));
        cy.saveLocalStorage();
      });

      // now we can log out
      cy.contains('.header-dropdown', Cypress.env('username')).click({ force: true });
      cy.contains('span', 'Log out').click({ force: true });
      cy.contains('Log in').should('be.visible');
    });

    it('does not stay logged in across sessions, after browser restart', () => {
      cy.contains('Log in').should('be.visible');
    });

    it('fails to access unknown resource', () => {
      const request = {
        url: Cypress.config().baseUrl + '/users',
        failOnStatusCode: false
      };
      cy.request(request).its('status').should('equal', 200);
      cy.contains('Log in').should('be.visible');
    });

    it('Does not log in with invalid password', () => {
      cy.clearCookies();
      cy.contains('Log in').should('be.visible');
      cy.get('[id=email]').clear().type(Cypress.env('username'));
      cy.get('[name=password]').clear().type('lewrongpassword');
      cy.contains('button', 'Log in').click();

      // still on /login page plus an error is displayed
      cy.contains('Log in').should('be.visible');
      cy.contains('There was a problem logging in').should('be.visible');
    });
  });

  describe('stays logged in across sessions, after browser restart if selected', () => {
    beforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}ui/`);
      Cypress.Cookies.preserveOnce('JWT');
    });

    it('pt1', () => {
      cy.clearCookies();
      cy.get('[id=email]').clear().type(Cypress.env('username'));
      cy.get('[name=password]').clear().type(Cypress.env('password'));
      cy.get('[type=checkbox]').check();
      cy.contains('button', 'Log in').click();
      cy.waitUntil(() => cy.getCookie('JWT').then(cookie => Boolean(cookie && cookie.value)));
    });

    it('pt2', () => {
      cy.contains('Log in')
        .should('not.exist')
        .then(() => cy.getCookie('JWT').should('have.property', 'value'));
    });
  });
});
