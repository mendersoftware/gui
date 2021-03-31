/// <reference types="Cypress" />
import { onlyOn } from '@cypress/skip-test';
import 'cypress-file-upload';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';

dayjs.extend(isBetween);

context('Files', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    Cypress.Cookies.preserveOnce('JWT');
    cy.visit('ui/#/releases');
  });

  it('allows file uploads', () => {
    // create an artifact to download first
    const fileName = 'mender-demo-artifact.mender';
    cy.contains('button', 'Upload').click();
    cy.fixture(fileName, 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('.MuiDialog-paper .dropzone input').attachFile(
          { filePath: fileName, fileName, fileContent, mimeType: 'application/octet-stream' },
          { subjectType: 'drag-n-drop' }
        );
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.contains('.MuiDialog-paper button', 'Upload').click().wait(5000); // give some extra time for the upload
      });
  });

  // it('allows uploading custom file creations', () => {
  //   cy.exec('mender-artifact write rootfs-image -f core-image-full-cmdline-qemux86-64.ext4 -t qemux86-64 -n release1 -o qemux86-64_release_1.mender')
  //     .then(result => {
  //       expect(result.code).to.be.equal(0)
  //         const encoding = 'base64'
  //         const fileName = 'qemux86-64_release_1.mender'
  //         cy.readFile(fileName, encoding).then(fileContent => {
  //           cy.get('.dropzone input')
  //             .upload({ fileContent, fileName, encoding, mimeType: 'application/octet-stream' })
  //             .wait(10000) // give some extra time for the upload
  //         })
  //       })
  // })

  it('allows artifact downloads', () => {
    // TODO allow download in tests, for reference: https://github.com/cypress-io/cypress/issues/949
    cy.get('.expandButton').click().end();
    cy.contains('Download Artifact');
    // .click().then(anchor => {
    //   const url = anchor.attr('href');
    //   cy.request(url).then(response =>
    //     cy.writeFile('tempArtifact', response.data)
    //   )
    // })
  });
});

context('Deployments', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.visit('ui/#/devices');
    cy.visit('ui/#/releases');
  });

  it('allows shortcut deployments', () => {
    // create an artifact to download first
    cy.get('.repository-list-item').contains('mender-demo-artifact').click().end();
    cy.get('a').contains('Create deployment').click({ force: true });
    cy.get('#deployment-device-group-selection', { timeout: 5000 }).type('All');
    cy.get('#deployment-device-group-selection-popup').get('li').contains('All devices').click().end();
    cy.get('button').contains('Next').click().end();
    onlyOn('staging', () => cy.get('.MuiDialog-container button').contains('Next').click());
    cy.get('.MuiDialog-container button').contains('Create').click();
    cy.get('.deployment-item', { timeout: 10000 });
    cy.get('[role="tab"]').contains('Finished').click();
    cy.get('.deployment-item:not(.deployment-header-item)', { timeout: 60000 });
    cy.get('.deployment-item:not(.deployment-header-item)')
      .get('time')
      .should($elems => {
        const time = dayjs($elems[0].getAttribute('datetime'));
        let earlier = dayjs().subtract(5, 'minutes');
        const now = dayjs();
        expect(time.isBetween(earlier, now));
      });
  });

  it('allows group deployments', () => {
    cy.get('a')
      .contains(/Deployments/i)
      .click()
      .end();
    cy.get('button')
      .contains(/Create a deployment/)
      .click({ force: true });
    cy.get('#deployment-release-selection', { timeout: 5000 }).type('mender-demo');
    cy.get('#deployment-release-selection-popup')
      .get('li')
      .contains(/mender-demo/i)
      .click()
      .end();
    cy.get('#deployment-device-group-selection', { timeout: 5000 }).type('testgroup');
    cy.get('#deployment-device-group-selection-popup').get('li').contains('testgroup').click().end();
    cy.get('button').contains('Next').click().end();
    onlyOn('staging', () => cy.get('.MuiDialog-container button').contains('Next').click());
    cy.get('.MuiDialog-container button').contains('Create').click();
    cy.get('.deployment-item', { timeout: 10000 });
    cy.get('[role="tab"]').contains('Finished').click();
    cy.get('.deployment-item:not(.deployment-header-item)', { timeout: 60000 });
  });
});
