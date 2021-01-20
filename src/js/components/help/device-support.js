import React from 'react';

const DeviceSupport = ({ docsVersion = '' }) => {
  const resources = [
    {
      target: `https://docs.mender.io/${docsVersion}client-installation/overview`,
      linkTitle: 'information about different ways to install the Mender client on your device'
    },
    {
      target: 'https://hub.mender.io/c/board-integrations/6',
      linkTitle: 'information about boards Mender has been integrated with'
    }
  ];
  return (
    <div>
      <h2>Device Support</h2>
      <p>
        The Mender client runs on the device in order to install software updates. Therefore, at minimum you need to install the client binary on the device and
        it must support the device OS and hardware architecture. This allows you to deploy application updates by using Update Modules.
        <br />
        For a detailed introduction to the different approaches to do this, please refer to our{' '}
        <a href={`https://docs.mender.io/${docsVersion}overview/device-support`} target="_blank" rel="noopener noreferrer">
          documentation on device support
        </a>
        .
      </p>
      <h2>Operating systems</h2>
      <p>
        Debian family OSes, such as Debian, Ubuntu and Raspberry Pi OS are officially supported. For devices running other types of Linux OSes such as Buildroot
        and OpenWRT, see existing integrations in the{' '}
        <a href={resources[1].target} target="_blank" rel="noopener noreferrer">
          Mender Hub community
        </a>
        . There you can also find information about integrations for the Yocto Project or{' '}
        <a href={`https://docs.mender.io/${docsVersion}system-updates-yocto-project`} target="_blank" rel="noopener noreferrer">
          follow our documentation
        </a>{' '}
        to integrate your own device.
      </p>
    </div>
  );
};

export default DeviceSupport;
