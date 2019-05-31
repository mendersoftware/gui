import React from 'react';
import { Link } from 'react-router-dom';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconButton from '@material-ui/core/IconButton';
import CopyPasteIcon from '@material-ui/icons/FileCopy';

export default class VirtualDevice extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      copied: false
    };
  }

  _copied() {
    var self = this;
    self.setState({ copied: true });
    setTimeout(() => {
      self.setState({ copied: false });
    }, 5000);
  }

  render() {
    var token = (this.props.org || {}).tenant_token;

    var codeToCopy = token ? `
      TENANT_TOKEN='${token}'\ndocker run -it -e SERVER_URL='https://hosted.mender.io' \\\n-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:latest
    ` : `docker run -it -e SERVER_URL='https://docker.mender.io' \\\n mendersoftware/mender-client-qemu:latest`;
    return (
      <div>
        <h2>Virtual device</h2>
        
        <div>
          <p>Mender supports virtual devices, which is handy as you do not need to configure any hardware to try Mender. You can
            start your own virtual devices by following the steps below.
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
            </div>
          ) : '' }

          <h4>Docker Engine</h4>
          <p>If you do not have it already, please install docker on the infrastructure where you want to start the virtual Mender client.</p>
          <p>
            For example, if you are using Ubuntu follow this tutorial:{' '}
            <a href="https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/" target="_blank">
              https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/
            </a>
          </p>

          {this.props.isHosted ? (
            <div>
              <h4>Your Hosted Mender tenant token</h4>
              <p>
                For security reasons, devices can only authenticate with Hosted Mender if they have a valid tenant token. The tenant token is unique for your
                organization and ensures that only devices that you own are able to connect to your Hosted Mender account, so please keep it secure.
              </p>
              <p>{'You can see your tenant token by clicking your user email at the top right and then choosing "My organization".'}</p>
              <p>Note however that we have pasted your tenant token in for you in the instructions below.</p>
            </div>
          ) : null}

          <h3>Start a virtual device</h3>

          <p>
            Note that the virtual device will run in the foreground in your terminal, so we recommend running it in a screen session you can detach (just type
            screen before running the commands below).
          </p>
          <p>
            To start a virtual device, just paste the following commands{' '}
            {this.props.isHosted ? <span>(we have pasted in your specific tenant token)</span> : null}
          </p>

          <div>
            <div className="code">
              <CopyToClipboard text={codeToCopy} onCopy={() => this._copied()}>
                <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }}>
                  <CopyPasteIcon/>
                </IconButton>
              </CopyToClipboard>
              <span style={{ wordBreak: 'break-word' }}>{codeToCopy}</span>
            </div>

            <p>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
          </div>
         
          <p>This will download and run the image for the virtual device. The image is about 500 MB, so be patient if your Internet connection is slow.</p>

          <p>
            When complete, you will see the virtual device login screen in your terminal. At this point it will take a couple of more minutes before the
            device will appear in your <Link to={'/devices'}>Devices tab</Link>. Authorize the device to enable you to deploy updates to it.
          </p>

          <h3>Deploy updates</h3>

          <p>
            Artifacts for your virtual devices are already uploaded to your account so you can start deploying updates right away. Take a look at the{' '}
            <Link to="/releases">Releases tab</Link>. If they have been removed, you can download them again from the{' '}
            <Link to="/help/connecting-devices/demo-artifacts">download page</Link>.
          </p>

          <p>
            Then head over to the <Link to="/deployments">Deployments tab</Link> and do some deployments to your virtual devices!
          </p>

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
       
      </div>
    );
  }
}
