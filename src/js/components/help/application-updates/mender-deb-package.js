import React from 'react';

import { getDebConfigurationCode, getDebInstallationCode } from '../../../helpers';
import CopyCode from '../../common/copy-code';

export default class DebPackage extends React.PureComponent {
  render() {
    const self = this;
    const { menderDebPackageVersion, ipAddress, isHosted, isEnterprise, org } = self.props;
    const token = (org || {}).tenant_token;
    const dpkgCode = getDebInstallationCode(menderDebPackageVersion);
    const codeToCopy = getDebConfigurationCode(ipAddress, isHosted, isEnterprise, token, menderDebPackageVersion);
    let title = 'Connecting to a demo server with demo settings';
    if (isEnterprise) {
      title = 'Connecting to an Enterprise server';
    } else if (isHosted) {
      title = 'Connecting to Mender Professional with demo settings';
    }
    return (
      <div>
        <h2>Connecting your device using Mender .deb package</h2>
        <p>
          Mender is available as a .deb package, to make it easy to install and use Mender for application-based updates on Debian, Ubuntu and Raspbian OSes. We
          currently provide packages for:
        </p>
        <ul>
          <li>
            armhf (ARM-v6):
            <ul>
              <li>Raspberry Pi, BeagleBone and other ARM based devices.</li>
            </ul>
          </li>
        </ul>

        <h3>Installing and configuring the .deb package</h3>
        <p>
          The Mender package comes with a wizard that will let you easily configure and customize your installation. To install and configure Mender run the
          following command:
        </p>
        <CopyCode code={dpkgCode} />
        <p>
          After the installation wizard is completed, Mender is correctly setup on your device and will automatically start in managed mode. Your device is now
          ready to authenticate with the server and start receiving updates.
        </p>

        <h3>Unattended installation</h3>
        <p>
          Alternatively to the above method, the package can be installed in a non-interactive way, suitable for scripts or other situations where no user input
          is desired. To learn about all configuration options, use `mender setup --help`.
        </p>
        <p>Use the below script to download and setup the Mender client for your Mender installation.</p>
        <h4>{title}</h4>

        <CopyCode code={codeToCopy} />
      </div>
    );
  }
}
