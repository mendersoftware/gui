import React from 'react';

import CopyCode from '../../common/copy-code';

export default class BuildYocto extends React.PureComponent {
  render() {
    const { docsVersion = '', isHosted, org = {} } = this.props;

    var token = org.tenant_token;
    var codeToCopy1 = 'bitbake-layers remove-layer ../meta-mender/meta-mender-demo';
    var codeToCopy2 = `MENDER_SERVER_URL = 'https://hosted.mender.io' \nMENDER_TENANT_TOKEN = '${token}'`;

    return (
      <div>
        <h2>Build with Yocto</h2>

        <h3>{`Don't yet have a working Yocto environment for your board?`}</h3>
        <p>
          Visit{' '}
          <a href="https://hub.mender.io/c/board-integrations" target="_blank" rel="noopener noreferrer">
            Mender Hub
          </a>{' '}
          and look for your board - your device may already have been integrated and tested by the community. If so, you can follow the instructions found there
          to set up the Yocto environment and configure the build.
        </p>

        <h3>If you already have a Yocto environment for your board</h3>

        <p>
          You can build your own Yocto Project images for use with Mender. By updating a small part of your build configuration, your newly provisioned devices
          will securely connect to the Mender server the first time they boot.
        </p>

        <p>
          Follow the docs at{' '}
          <a href={`https://docs.mender.io/${docsVersion}system-updates-yocto-project/build-for-demo`} target="_blank" rel="noopener noreferrer">
            {`https://docs.mender.io/${docsVersion}system-updates-yocto-project/build-for-demo`}
          </a>{' '}
          to build your .sdimg and .mender files.
        </p>

        {isHosted ? (
          <div>
            <p>Do the following steps to integrate your build with Hosted Mender:</p>

            <h4>Remove demo layer if used</h4>

            <p>
              You should not be using the <span className="code">meta-mender-demo layer</span>. If you have it in your build environment, you need to remove it.
            </p>
            <p>
              Go to your <span className="code">build</span> directory and run the following command:
            </p>

            <CopyCode code={codeToCopy1} />
            <h4>Update local.conf for Hosted Mender</h4>

            <p>
              Add or replace the following two lines in your <span className="code">local.conf</span>:
            </p>

            <CopyCode code={codeToCopy2} />

            <p>
              You can the use the output .sdimg and .mender files to connect to your Mender server and deploy updates, as outlined{' '}
              <a href={`https://docs.mender.io/${docsVersion}system-updates-yocto-project/build-for-demo`} target="_blank" rel="noopener noreferrer">
                in the tutorial
              </a>
              .
            </p>
          </div>
        ) : null}
      </div>
    );
  }
}
