import { onlyOn } from '@cypress/skip-test';
import jwtDecode from 'jwt-decode';

/// <reference types="Cypress" />

context('Test setup', () => {
  describe('basic window checks', () => {
    beforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}ui/`);
    });

    it('cy.window() - get the global window object', () => {
      cy.window().should('have.property', 'top');
    });
    it('cy.document() - get the document object', () => {
      cy.document().should('have.property', 'charset').and('eq', 'UTF-8');
    });
    it('cy.title() - get the title', () => {
      cy.title().should('include', 'Mender');
    });
  });

  onlyOn('staging', () => {
    describe('account creation', () => {
      it('allows account creation', () => {
        cy.visit(`${Cypress.config().baseUrl}ui/`);
        cy.contains('Sign up').should('be.visible');
        cy.contains('Sign up').click();
        cy.log(`creating user with username: ${Cypress.env('username')} and password: ${Cypress.env('password')}`);
        cy.get('[id=email]').type(Cypress.env('username'));
        cy.waitUntil(() => {
          cy.get('[id=password_new]').clear().type(Cypress.env('password'));
          cy.get('[id=password_confirmation]').clear().type(Cypress.env('password'));
          return cy
            .get('[id=password_new]')
            .invoke('val')
            .then(initialText => {
              cy.get('[id=password_confirmation]')
                .invoke('val')
                .then(text => {
                  return Promise.resolve(text && text == initialText);
                });
            });
        });
        cy.contains('button', 'Sign up').click();
        cy.get('[id=name]').type('CI test corp');
        cy.get('[id=tos]').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000)
          .get('iframe')
          .its('0.contentDocument.body')
          .should('not.be.undefined')
          .and('not.be.empty')
          .then(cy.wrap)
          .find('#recaptcha-anchor')
          .click()
          .wait(2000)
          .end();
        cy.contains('button', 'Complete').click();
        cy.waitUntil(() => cy.getCookie('JWT').then(cookie => Boolean(cookie && cookie.value && cookie.value !== 'undefined')), { timeout: 15000 });
        cy.setCookie('cookieconsent_status', 'allow');
        cy.getCookie('JWT').then(cookie => {
          const userId = jwtDecode(cookie.value).sub;
          localStorage.setItem(`${userId}-onboarding`, JSON.stringify({ complete: true }));
          cy.saveLocalStorage();
        });
        cy.waitUntil(() => cy.contains('Devices'), { timeout: 15000 });
      });
    });
    describe('tenant setup', () => {
      before(() => {
        // enter valid username and password
        cy.login(Cypress.env('username'), Cypress.env('password'));
        cy.restoreLocalStorage();
      });
      it('supports tenant token retrieval', () => {
        cy.tenantTokenRetrieval();
      });
    });
  });
});
