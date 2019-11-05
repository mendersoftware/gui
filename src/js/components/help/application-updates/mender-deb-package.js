import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconButton from '@material-ui/core/IconButton';
import CopyPasteIcon from '@material-ui/icons/FileCopy';
import AppStore from '../../../stores/app-store';
import { findLocalIpAddress, getDebConfigurationCode } from '../../../helpers';

export default class DebPackage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      codeToCopy: false,
      dpkgCodeCopied: false,
      ipAddress: AppStore.getHostAddress()
    };
  }

  componentDidMount() {
    const self = this;
    if (!self.state.ipAddress || self.state.ipAddress === 'X.X.X.X') {
      findLocalIpAddress().then(ipAddress => self.setState({ ipAddress }));
    }
  }

  _copied(ref) {
    var self = this;
    var toSet = {};
    toSet[ref] = true;
    self.setState(toSet);
    setTimeout(() => {
      toSet[ref] = false;
      self.setState(toSet);
    }, 5000);
  }

  render() {
    const self = this;
    const { codeToCopyCopied, dpkgCodeCopied, ipAddress } = self.state;
    const token = (self.props.org || {}).tenant_token;
    const isHosted = AppStore.getIsHosted();
    const isEnterprise = AppStore.getIsEnterprise();
    const debPackageVersion = AppStore.getMenderDebPackageVersion();
    const dpkgCode = `wget https://d1b0l86ne08fsf.cloudfront.net/${debPackageVersion}/dist-packages/debian/armhf/mender-client_${debPackageVersion}-1_armhf.deb &&
    sudo dpkg -i mender-client_${debPackageVersion}-1_armhf.deb`;

    const codeToCopy = getDebConfigurationCode(ipAddress, isHosted, isEnterprise, token, debPackageVersion);
    let title = 'Connecting to a demo server with demo settings';
    if (isEnterprise || isHosted) {
      title = 'Connecting to an Enterprise server';
      if (isHosted) {
        title = 'Connecting to Mender Professional with demo settings';
      }
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
        <div className="code">
          <CopyToClipboard text={dpkgCode} onCopy={() => self._copied('dpkgCodeCopied')}>
            <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }}>
              <CopyPasteIcon />
            </IconButton>
          </CopyToClipboard>
          <span style={{ wordBreak: 'break-word' }}>{dpkgCode}</span>
        </div>
        <p>{dpkgCodeCopied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>

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
        <div className="code">
          <CopyToClipboard text={codeToCopy} onCopy={() => self._copied('codeToCopyCopied')}>
            <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }}>
              <CopyPasteIcon />
            </IconButton>
          </CopyToClipboard>
          <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{codeToCopy}</span>
        </div>
        <p>{codeToCopyCopied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
      </div>
    );
  }
}
