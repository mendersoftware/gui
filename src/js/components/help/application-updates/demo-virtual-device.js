import React from 'react';
import { Link } from 'react-router-dom';

import CopyCode from '../../common/copy-code';

export default class VirtualDevice extends React.PureComponent {
  render() {
    var token = (this.props.org || {}).tenant_token;

    var codeToCopy = token
      ? `
      TENANT_TOKEN='${token}'\ndocker run -it -e SERVER_URL='https://hosted.mender.io' \\\n-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:latest
    `
      : `./demo --client up`;
    return (
      <div>
        <h2>Virtual device</h2>

        <div>
          <p>
            Mender supports virtual devices, which is handy as you do not need to configure any hardware to try Mender. You can start your own virtual devices
            by following the steps below.
          </p>

          <h3>Prerequisites</h3>

          <h4>Infrastructure to run the virtual device</h4>
          <p>You need to start virtual devices on your own infrastructure (e.g. your workstation or EC2 instance).</p>

          {this.props.isHosted ? (
            <div>
              <h4>Ability to connect to Hosted Mender over the Internet</h4>
              <p>
                On the infrastructure you run the virtual Mender client, you need to be able to create outgoing TCP connections to hosted.mender.io and
                s3.amazonaws.com, both on port 443 (TLS).
              </p>
              <p>As the Mender client does not listen to any ports there are no incoming connections.</p>

              <h4>Docker Engine</h4>
              <p>If you do not have it already, please install docker on the infrastructure where you want to start the virtual Mender client.</p>
              <p>
                For example, if you are using Ubuntu follow this tutorial:{' '}
                <a href="https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/" target="_blank">
                  https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/
                </a>
              </p>

              <h4>Your Hosted Mender tenant token</h4>
              <p>
                For security reasons, devices can only authenticate with Hosted Mender if they have a valid tenant token. The tenant token is unique for your
                organization and ensures that only devices that you own are able to connect to your Hosted Mender account, so please keep it secure.
              </p>
              <p>{'You can see your tenant token by clicking your user email at the top right and then choosing "My organization".'}</p>
              <p>Note however that we have pasted your tenant token in for you in the instructions below.</p>
            </div>
          ) : (
            <div>
              <p>
                As you are running Mender on-premise, for these instructions we assume that you already have Docker installed and the Mender integration
                environment up and running on your machine.
              </p>
            </div>
          )}

          <h3>Start a virtual device</h3>

          {this.props.isHosted ? (
            <p>
              Note that the virtual device will run in the foreground in your terminal, so we recommend running it in a screen session you can detach (just type
              screen before running the commands below).
            </p>
          ) : (
            ''
          )}
          <p>
            To start a virtual device, {!this.props.isHosted ? 'change directory into the folder where you cloned Mender integration, then' : ''} paste and run
            the following command {this.props.isHosted ? <span>(we have pasted in your specific tenant token)</span> : null}
          </p>

          <CopyCode code={codeToCopy} />

          {this.props.isHosted ? (
            <p>This will download and run the image for the virtual device. The image is about 500 MB, so be patient if your Internet connection is slow.</p>
          ) : (
            ''
          )}

          <p>
            {this.props.isHosted
              ? 'When complete, you will see the virtual device login screen in your terminal. At this point it will take a couple of more minutes before the '
              : 'The '}
            device will appear in your <Link to={'/devices/pending'}>Pending devices tab</Link>. Authorizing the device will enable you to deploy updates to it.
          </p>

          <h3>Deploying updates</h3>

          <p>
            The next step is to upload an Artifact. Artifacts can be uploaded to the server in the <Link to="/releases">Releases tab</Link>. You should see a
            tooltip which provides a link to a demo Artifact for you to use, or you can learn more about building a demo Artifact{' '}
            <Link to="/help/releases-artifacts/build-demo-artifact">here</Link>.
          </p>

          <p>
            Once you have an Artifact uploaded, head over to the <Link to="/deployments">Deployments tab</Link> to deploy it to your virtual device!
          </p>

          {this.props.isHosted ? (
            <div>
              <h3>Manage the virtual device</h3>

              <p>
                If you started your virtual device in screen, you can keep it running by backgrounding it with Ctrl + A, Ctrl + D. Then you can reconnect to it
                later with screen -r.
              </p>
              <p>You may also start more than one virtual device if you want.</p>
              <p>
                {`To stop a virtual device after you are done testing, simply switch to its terminal, login as root (no password) and type "shutdown -h now" in its
                terminal. You can then also decommission it in the Hosted Mender interface.`}
              </p>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}
