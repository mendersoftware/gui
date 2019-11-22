import React from 'react';
import { Link } from 'react-router-dom';

const updateOptions = [
  { content: 'Connect devices with .deb package', target: '/help/application-updates/mender-deb-package' },
  { content: 'Connect a virtual device for demo/testing purposes', target: '/help/application-updates/demo-virtual-device' },
  { content: 'Enabling different kinds of updates with update modules', target: '/help/application-updates/update-modules' }
];

const ApplicationUpdates = () => (
  <div>
    <h2>Application Updates</h2>

    <p>Learn how to get started quickly with Application updates:</p>
    <ul>
      {updateOptions.map(item => (
        <li key={item.target}>
          <p>
            <Link to={item.target}>{item.content}</Link>
          </p>
        </li>
      ))}
    </ul>

    <p>
      For more robust and reliable updates, <Link to={`/help/system-updates`}>learn about Mender’s System updates</Link>, which we recommend for production.
    </p>
  </div>
);

export default ApplicationUpdates;
