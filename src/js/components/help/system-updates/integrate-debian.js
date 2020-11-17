import React from 'react';

const IntegrateDebian = ({ docsVersion = '' }) => (
  <div>
    <h2>Integrate with Debian family</h2>

    <p>
      If you&#39;d like to integrate a board with the Debian family of OSes - for example Debian, Ubuntu, or Raspbian - you can use our{' '}
      <span className="code">mender-convert</span> utility to convert existing disk images for use with Mender.
    </p>

    <p>
      <a href={`https://docs.mender.io/${docsVersion}system-updates-debian-family`} target="_blank" rel="noopener noreferrer">
        Read our documentation
      </a>{' '}
      on building a Mender Debian image.
    </p>
    <p>
      You can also look in the{' '}
      <a href="https://hub.mender.io/c/board-integrations/debian-family" target="_blank" rel="noopener noreferrer">
        Debian family category on Mender Hub
      </a>{' '}
      to find if your board or a similar board has already been tested with Mender.
    </p>
  </div>
);

export default IntegrateDebian;
