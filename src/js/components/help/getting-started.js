import React from 'react';

import { Launch as LaunchIcon } from '@mui/icons-material';

const InlineLaunchIcon = () => <LaunchIcon style={{ 'verticalAlign': 'text-bottom' }} fontSize="small" />;

const GettingStarted = ({ docsVersion = '' }) => (
  <div>
    <h2>Getting started</h2>
    <h3>Get Started guide</h3>
    <p>
      To quickly get started with the common use cases of Mender, follow the{' '}
      <a href={`https://docs.mender.io/${docsVersion}get-started`} target="_blank" rel="noopener noreferrer">
        Get Started chapter in our documentation <InlineLaunchIcon />
      </a>
      .
    </p>
    <h3>Installing Mender on your devices</h3>
    <p>
      We support several ways of integrating your devices with Mender. For a detailed introduction read the{' '}
      <a href={`https://docs.mender.io/${docsVersion}client-installation`} target="_blank" rel="noopener noreferrer">
        Client Installation documentation <InlineLaunchIcon />
      </a>
      .
    </p>
    <p>
      Integrations for different boards and operating systems can be found on{' '}
      <a href="https://hub.mender.io/c/board-integrations/6" target="_blank" rel="noopener noreferrer">
        Mender Hub <InlineLaunchIcon />
      </a>
    </p>
    <h3>Creating Artifacts</h3>
    <p>
      Everything you need to package your software for deployment with Mender can be found here:{' '}
      <a href={`https://docs.mender.io/${docsVersion}artifact-creation`} target="_blank" rel="noopener noreferrer">
        Artifact Creation documentation <InlineLaunchIcon />
      </a>
      .
    </p>
  </div>
);

export default GettingStarted;
