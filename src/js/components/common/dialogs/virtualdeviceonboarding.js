import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { setOnboardingApproach } from '../../../actions/onboardingActions';
import CopyCode from '../copy-code';

export class VirtualDeviceOnboarding extends React.PureComponent {
  componentDidMount() {
    this.props.setOnboardingApproach('virtual');
  }

  render() {
    const self = this;
    const { isHosted, token } = self.props;

    let codeToCopy = token
      ? `
      TENANT_TOKEN='${token}'\ndocker run -it -e SERVER_URL='https://hosted.mender.io' \\\n-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:latest
    `
      : './demo --client up';

    return (
      <div>
        {isHosted ? (
          <div>
            <b>1. Get Docker Engine</b>
            <p>If you do not have it already, please install Docker on your local machine.</p>
            <p>
              For example if you are using Ubuntu follow this tutorial:{' '}
              <a href="https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/" target="_blank">
                https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/
              </a>
            </p>
          </div>
        ) : (
          <div>
            <b>1. Prerequisites</b>
            <p>
              As you are running Mender on-premise, for these instructions we assume that you already have Docker installed and the Mender integration
              environment up and running on your machine.
            </p>
            <p>To start a virtual device, change directory into the folder where you cloned Mender integration.</p>
          </div>
        )}
        <p>
          <b>2. Copy & paste and run the following command to start the virtual device:</b>
        </p>
        <CopyCode code={codeToCopy} withDescription={true} />
        <p>The device should appear in the Pending devices view in a couple of minutes.</p>
        <p>
          Visit the <Link to="/help/application-updates/demo-virtual-device">Virtual Devices Help page</Link> for more info on managing the virtual device.
        </p>
      </div>
    );
  }
}

const actionCreators = { setOnboardingApproach };

const mapStateToProps = state => {
  return {
    isHosted: state.app.features.isHosted,
    token: state.organization.organization.tenant_token
  };
};

export default connect(mapStateToProps, actionCreators)(VirtualDeviceOnboarding);
