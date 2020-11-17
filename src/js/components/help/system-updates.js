import React from 'react';
import { Link } from 'react-router-dom';

const updateOptions = [
  { content: 'Supported board integrations on Mender Hub', target: '/help/system-updates/board-integrations' },
  { content: 'Building a Mender-enabled Yocto image', target: '/help/system-updates/build-with-yocto' },
  { content: 'Devices running Debian family OSes', target: '/help/system-updates/integrate-debian' }
];

const SystemUpdates = ({ docsVersion = '' }) => (
  <div>
    <h2>System Updates</h2>

    <p>
      The built-in update mechanism in Mender is dual A/B rootfs updates, meaning the whole system on the device is updated. To enable system updates, the
      device needs to have an A/B partition layout with the Mender client installed in its disk image.
    </p>

    <p>
      We prepared images, fully integrated with Mender for you to start with. You can find them on our{' '}
      <a href={`https://docs.mender.io/${docsVersion}downloads#disk-images`} target="_blank" rel="noopener noreferrer">
        downloads page
      </a>
      .
    </p>

    <p>Learn how to enable and connect your devices for system updates:</p>
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
      You can learn more about Mender&#39;s A&#47;B partition architecture{' '}
      <a href={`https://docs.mender.io/${docsVersion}overview/introduction`} target="_blank" rel="noopener noreferrer">
        here
      </a>
      .
    </p>
  </div>
);

export default SystemUpdates;
