import './commands';

Cypress.Cookies.defaults({
  preserve: ['tenantToken', 'cookieconsent_status', 'noExpiry']
});
