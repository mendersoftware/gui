import { onlyOn } from '@cypress/skip-test';
import { Decoder } from '@nuintun/qrcode';

/// <reference types="Cypress" />

context('Settings', () => {
  onlyOn('staging', () => {
    before(() => {
      cy.login(Cypress.env('username'), Cypress.env('password'));
      cy.restoreLocalStorage();
      cy.tenantTokenRetrieval();
      Cypress.Cookies.preserveOnce('JWT');
    });
    describe('Account upgrades', () => {
      it('allows upgrading to Professional', () => {
        cy.contains('[role="button"]', 'Upgrade now').click();
        cy.contains('Organization').click();
        cy.contains('[role="button"]', 'Upgrade now').click();
        cy.contains('.planPanel', 'Professional').click();
        cy.waitUntil(() => cy.frameLoaded('.StripeElement iframe'));
        cy.enter('.StripeElement iframe').then(body => {
          body().find('[name="cardnumber"]').type('4242424242424242');
          body().find('[name="exp-date"]').type('1232');
          body().find('[name="cvc"]').type('123');
          body().find('[name="postal"]').type('12345');
        });
        cy.contains('button', 'Sign up').click();
        cy.contains('Your upgrade was successful!', { timeout: 10000 }).should('be.visible');
        cy.contains('Organization name', { timeout: 10000 });
        cy.contains('Organization name').should('be.visible');
      });
      it('allows higher device limits once upgraded', () => {
        cy.get('#limit a.inline span').contains('250').should('be.visible');
        cy.getCookie('tenantToken').then(({ value: token }) => {
          cy.task('startClient', { token, count: 50 });
          cy.visit(`${Cypress.config().baseUrl}ui/#/devices`);
          cy.get('.header-section [href="/ui/#/devices/pending"]', { timeout: 120000 }).should('be.visible');
          cy.get('.header-section [href="/ui/#/devices/pending"]').contains('pending').should('be.visible');
          cy.get('.header-section [href="/ui/#/devices/pending"]')
            .invoke('text')
            .then(pendingNotification => {
              cy.wrap(Number(pendingNotification.split(' ')[0])).should('be.gt', 10);
            });
        });
      });
    });
    describe('2FA setup', () => {
      it('supports regular 2fa setup', () => {
        cy.login(Cypress.env('username'), Cypress.env('password'));
        cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
        cy.contains('Enable Two Factor').click();
        cy.waitUntil(() => cy.get('.margin-top img'));
        cy.get('.margin-top img').then(qrImg => {
          const qrcode = new Decoder();
          cy.wrap(qrcode.scan(qrImg.prop('src'))).then(decodedQr => {
            const qrData = new URLSearchParams(decodedQr.data);
            cy.task('generateOtp', qrData.get('secret')).then(token => {
              console.log('Generated otp:', token);
              cy.get('#token2fa').type(token, { force: true });
              cy.contains('button', 'Verify').click({ force: true });
              cy.get('ol').should('contain', 'Verified');
              cy.contains('button', 'Save').click();
              cy.contains('.header-dropdown', Cypress.env('username')).click();
              // eslint-disable-next-line cypress/no-unnecessary-waiting
              cy.contains('span', 'Log out').click().wait(1000).clearCookies().visit(`${Cypress.config().baseUrl}ui/`).contains('Log in').should('be.visible');
            });
          });
        });
      });
      it(`prevents from logging in without 2fa code`, () => {
        cy.visit(`${Cypress.config().baseUrl}ui/`);
        cy.clearCookies();
        cy.contains('Log in').should('be.visible');
        // enter valid username and password
        cy.get('[id=email]').clear().type(Cypress.env('username'));
        cy.get('[name=password]').clear().type(Cypress.env('password'));
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.contains('button', 'Log in').click().wait(1000).contains('button', 'Log in').click().wait(1000);
        // still on /login page plus an error is displayed
        cy.contains('Log in').should('be.visible');
        cy.contains('There was a problem logging in').should('be.visible');
      });
      it('allows turning 2fa off again', () => {
        cy.visit(`${Cypress.config().baseUrl}ui/#/login`);
        cy.get('[id=email]').clear().type(Cypress.env('username'));
        cy.get('[id=password]').clear().type(Cypress.env('password'));
        cy.contains('button', 'Log in').click();
        cy.task('generateOtp').then(newToken => {
          cy.get('#token2fa').type(newToken, { force: true });
          cy.contains('button', 'Log in').click();
          cy.waitUntil(() => cy.getCookie('JWT').then(cookie => Boolean(cookie && cookie.value && cookie.value !== 'undefined')));
          cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.contains('Enable Two Factor').click().wait(2000);
        });
      });
      it('allows logging in without 2fa after deactivation', () => {
        cy.login(Cypress.env('username'), Cypress.env('password'));
        cy.visit(`${Cypress.config().baseUrl}ui/#/settings`);
      });
    });
  });

  describe('Basic setting features', () => {
    it('allows access to user management', () => {
      cy.login(Cypress.env('username'), Cypress.env('password'));
      cy.restoreLocalStorage();
      cy.waitUntil(() => cy.visit(`${Cypress.config().baseUrl}ui/#/settings`).contains(/Global settings/i));
      cy.contains(/user management/i).click();
      cy.contains('button', 'Create new user').should('be.visible');
    });
    it('allows email changes', () => {
      cy.login(Cypress.env('username'), Cypress.env('password'));
      cy.restoreLocalStorage();
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_email').click();
    });
    it('allows changing the password', () => {
      cy.login(Cypress.env('username'), Cypress.env('password'));
      cy.restoreLocalStorage();
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_password').click();
      cy.get('[name=password]').should('be.empty');
      cy.window().then(win => {
        cy.stub(win, 'prompt').returns('DISABLED WINDOW PROMPT');
      });
      cy.contains('button', 'Generate').click();
      cy.get('[name=password]').invoke('val').should('not.be.empty');
      cy.get('[name=password]').clear().type('mysecretpassword!456');
      cy.get('.rightFluid').last().contains('button', 'Save').click();
      cy.contains('user has been updated', { timeout: 10000 });
      cy.contains('.header-dropdown', Cypress.env('username')).click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.contains('span', 'Log out').click().wait(1000).clearCookies().visit(`${Cypress.config().baseUrl}ui/`);
      cy.contains('Log in', { timeout: 10000 }).should('be.visible');
    });

    it('allows changing the password back', () => {
      cy.visit(`${Cypress.config().baseUrl}ui/`);
      if (cy.contains('Log in').should('be.visible')) {
        cy.get('[id=email]').clear().type(Cypress.env('username'));
        cy.get('[name=password]').clear().type('mysecretpassword!456').clear().type('mysecretpassword!456');
        cy.contains('button', 'Log in').click();
        cy.waitUntil(() => cy.getCookie('JWT').then(cookie => Boolean(cookie && cookie.value)));
      }
      cy.visit(`${Cypress.config().baseUrl}ui/#/settings/my-account`);
      cy.get('#change_password').click();
      cy.get('[name=password]').clear().type(Cypress.env('password')).clear().type(Cypress.env('password'));
      cy.get('.rightFluid').last().contains('button', 'Save').click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.contains('user has been updated', { timeout: 10000 }).wait(3000);
      cy.waitUntil(() =>
        cy
          .login(Cypress.env('username'), Cypress.env('password'), false)
          .getCookie('JWT')
          .then(cookie => Boolean(cookie && cookie.value))
      );
    });
  });
});
