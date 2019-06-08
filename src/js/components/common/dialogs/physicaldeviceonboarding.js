import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

import HelpIcon from '@material-ui/icons/Help';

import AutoSelect from '../forms/autoselect';
import AppActions from '../../../actions/app-actions';
import AppStore from '../../../stores/app-store';
import { findLocalIpAddress } from '../../../helpers';

export default class PhysicalDeviceOnboarding extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selection: null,
      ipAddress: null,
      copied: false
    };
  }

  componentDidMount() {
    const self = this;
    findLocalIpAddress().then(ipAddress => self.setState({ ipAddress }));
  }

  componentWillUnmount() {
    setTimeout(() => {
      const pendingDevices = AppStore.getPendingDevices();
      const allDevices = AppStore.getAllDevices();
      if (!(pendingDevices.length || allDevices.length)) {
        AppActions.setConnectingDialogProgressed(null);
      }
    }, 1000 * 60 * 60); // show regular tooltip if 1 hour after this dialog still no device was connected
  }

  copied() {
    var self = this;
    self.setState({ copied: true });
    AppActions.setConnectingDialogProgressed(Date.now());
    setTimeout(() => {
      self.setState({ copied: false });
    }, 5000);
  }

  onSelect(deviceType) {
    AppActions.setOnboardingDeviceType(deviceType);
    this.setState({ selection: deviceType });
  }

  render() {
    const self = this;
    const { ipAddress, selection } = self.state;
    const { token } = self.props;

    /* TODO: Figure out the user IP address automatically or extend the instructions to an extra step */
    let connectionInstructions = `
      sudo sed /etc/mender/mender.conf -i -e "/Paste your Hosted Mender token here/d;s/hosted.mender.io/docker.mender.io/;1 a \\ \\ \\"ServerCertificate\\": \\"/etc/mender/server.crt\\","
      sudo wget -q -O /etc/mender/server.crt https://raw.githubusercontent.com/mendersoftware/meta-mender/master/meta-mender-demo/recipes-mender/mender/files/server.crt
      DOCKER_HOST_IP="${ipAddress ? ipAddress : 'X.X.X.X'}"
      grep "\\ss3.docker.mender.io" /etc/hosts >/dev/null 2>&1 || echo "$DOCKER_HOST_IP s3.docker.mender.io # Added by mender" | sudo tee -a /etc/hosts > /dev/null
      grep "\\sdocker.mender.io" /etc/hosts >/dev/null 2>&1 || echo "$DOCKER_HOST_IP docker.mender.io # Added by mender" | sudo tee -a /etc/hosts > /dev/null
    `;
    if (token) {
      connectionInstructions = `
        TENANT_TOKEN="'${token}'"
      sudo sed -i "s/Paste your Hosted Mender token here/$TENANT_TOKEN/" /etc/mender/mender.conf
    `;
    }
    /* TODO: Replace the hardcoded master with the mender-client version */
    let codeToCopy = `wget https://d1b0l86ne08fsf.cloudfront.net/master/dist-packages/debian/armhf/mender-client_master-1_armhf.deb
    sudo dpkg -i mender-client_master-1_armhf.deb
    sudo cp /etc/mender/mender.conf.demo /etc/mender/mender.conf
     ${connectionInstructions}
    sudo mkdir -p /var/lib/mender
    echo "device_type=${selection}" | sudo tee /var/lib/mender/device_type
    sudo systemctl enable mender && sudo systemctl restart mender
    `;

    const types = [
      {
        title: 'BeagleBone',
        value: 'beaglebone'
      },
      {
        title: 'Raspberry Pi 3',
        value: 'raspberrypi3'
      },
      {
        title: 'Generic ARMv6 or newer',
        value: 'generic-armv6'
      },
      {
        title: 'Generic x86',
        value: 'generic-x86_64'
      }
    ];

    const steps = {
      1: (
        <div className="flexbox column">
          <b>1. Enter your device type</b>
          <p>Setting this attribute on the device ensures that the device will only receive updates for compatible software releases.</p>
          <div className="flexbox centered">
            <AutoSelect label="Device type" errorText="Choose a device type" items={types} onChange={item => self.onSelect(item)} />
          </div>
          <div id="onboard-connect-1" className="tooltip help highlight" data-tip data-for="physical-device-type-tip" data-event="click focus">
            <HelpIcon />
          </div>
          <ReactTooltip
            id="physical-device-type-tip"
            globalEventOff="click"
            place="bottom"
            type="light"
            effect="solid"
            className="react-tooltip"
            style={{ maxWidth: 300 }}
          >
            If you don&apos;t see your exact device on the list, choose <i>generic-x86_x64</i> to continue the tutorial for now.
          </ReactTooltip>
        </div>
      ),
      2: (
        <div>
          <b>2. SSH into your device and install the Mender client</b>
          <p>
            Copy & paste and run this command <b>on your device</b>:
          </p>
          <div className="code">
            <CopyToClipboard text={codeToCopy} onCopy={() => self.copied(true)}>
              <Button style={{ float: 'right', margin: '-10px 0 0 10px' }} icon={<Icon className="material-icons">content_paste</Icon>}>
                Copy to clipboard
              </Button>
            </CopyToClipboard>
            <span style={{ wordBreak: 'break-word' }}>{codeToCopy}</span>
          </div>
          <p>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
          <p>This downloads the Mender client on the device, sets the configuration and starts the client.</p>
          <p>
            Once the client has started, your device will attempt to connect to the server. It will then appear in your Pending devices tab and you can
            continue.
          </p>
        </div>
      )
    };
    return <div>{steps[self.props.progress]}</div>;
  }
}
