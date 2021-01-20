import React from 'react';

const GettingStarted = ({ docsVersion = '' }) => (
  <div>
    <h2>Get Started</h2>
    <p>
      Your devices first need to have the Mender client running on them in order to connect to the server. We support several ways of integrating your device
      with Mender and connecting it to the Mender server.
    </p>
    <p>
      For a detailed introduction to the different approaches to do this, please refer to our{' '}
      <a href={`https://docs.mender.io/${docsVersion}get-started`} target="_blank" rel="noopener noreferrer">
        documentation
      </a>
      .
    </p>
  </div>
);

export default GettingStarted;
