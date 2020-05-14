import React from 'react';

const Devices = ({ docsVersion = '' }) => (
  <div>
    <h2>Devices</h2>
    <p></p>
    <p>
      <a href={`https://docs.mender.io/${docsVersion}devices`} target="_blank">
        Read the documentation for more on Devices
      </a>
      .
    </p>
  </div>
);

export default Devices;
