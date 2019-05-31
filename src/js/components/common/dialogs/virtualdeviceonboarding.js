import React from 'react';
import { Link } from 'react-router-dom';
import CopyToClipboard from 'react-copy-to-clipboard';

import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import AppStore from '../../../stores/app-store';

export default class VirtualDeviceOnboarding extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      copied: false
    };
  }

  copied() {
    var self = this;
    self.setState({ copied: true });
    setTimeout(() => {
      self.setState({ copied: false });
    }, 5000);
  }

  render() {
    const self = this;
    const { token } = self.props;
    const isHosted = AppStore.getIsHosted();
    let hasDivergingHostname = !isHosted && window.location.hostname !== 'docker.mender.io';

    let codeToCopy = `
      TENANT_TOKEN='${token}'\ndocker run -it -e SERVER_URL='https://hosted.mender.io' \\\n-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:latest
    `;

    if (!isHosted) {
      codeToCopy = `
        docker run -it -e SERVER_URL='https://docker.mender.io' mendersoftware/mender-client-qemu:latest
      `;
    }

    return (
      <div>
        <b>1. Get Docker Engine</b>
        If you do not have it already, please install Docker on your local machine.
        <p>
          For example if you are using Ubuntu follow this tutorial:{' '}
          <a href="https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/" target="_blank">
            https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/
          </a>
        </p>
        <b>2. Copy & paste and run the following command to start the virtual device:</b>
        <div className="code">
          <CopyToClipboard text={codeToCopy} onCopy={() => this.copied()}>
            <Button style={{ float: 'right', margin: '-10px 0 0 10px' }} icon={<Icon className="material-icons">content_paste</Icon>}>
              Copy to clipboard
            </Button>
          </CopyToClipboard>
          <span style={{ wordBreak: 'break-word' }}>{codeToCopy}</span>
        </div>
        <p>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
        {hasDivergingHostname ? (
          <p>
            <span className="red fadeIn">
              You might have to adjust the <i>SERVER_URL</i> to match the location of your server instance.
            </span>
          </p>
        ) : null}
        <p>The device should appear in the Pending devices view in a couple of minutes.</p>
        <p>
          Visit the <Link to="/help/connecting-devices/provision-a-demo/virtual-device">Virtual Devices Help page</Link> for more info on managing the virtual
          device.
        </p>
      </div>
    );
  }
}
