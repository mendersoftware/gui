import React from 'react';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';
var AppStore = require('../../../stores/app-store');

var createReactClass = require('create-react-class');

import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

var VirtualDevice =  createReactClass({

  getInitialState: function() {
    return {
      copied: false,
    };
  },

  _copied: function() {
    var self = this;
    self.setState({copied: true});
    setTimeout(function() {
      self.setState({copied: false});
    }, 5000);
  },
 
  render: function() {

    var token = (this.props.org || {}).tenant_token;

    var codeToCopy =  "TENANT_TOKEN='" + token + "' \ndocker run -it -e SERVER_URL='https://hosted.mender.io' \\\n-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:latest" ;

    return (

        <div>

          <h2>Virtual device</h2>

          {this.props.isHosted ?

          <div>

            <p>Mender supports virtual devices, which is handy as you do not need to configure any hardware to try Mender.</p>
            <p>One virtual device was automatically started for you when your account was created; it will expire after 14 days from account creation. You can start your own virtual devices by following the steps below.</p>

            <h3>Prerequisites</h3>

            <h4>Infrastructure to run the virtual device</h4>
            <p>You need to start virtual devices on your own infrastructure (e.g. your workstation or EC2 instance).</p>

            <h4>Ability to connect to Hosted Mender over the Internet</h4>
            <p>On the infrastructure you run the virual Mender client, you need to be able to create outgoing TCP connections to hosted.mender.io and s3.amazonaws.com, both on port 443 (TLS).</p>
            <p>As the Mender client does listen to any ports there are no incoming connections.</p>

            <h4>Docker Engine</h4>
            <p>If you do not have it already, please install docker on the infrastructure where you want to start the virtual Mender client.</p>
            <p>For example, if you are using Ubuntu follow this tutorial: <a href="https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/" target="_blank">https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/</a></p>

            {this.props.hasMultitenancy ?

              <div>
                <h4>Your Hosted Mender tenant token</h4>
                <p>For security reasons, devices can only authenticate with Hosted Mender if they have a valid tenant token.
                The tenant token is unique for your organization and ensures that only devices that you own are able to connect to your Hosted Mender account, so please keep it secure.</p>
                <p>You can see your tenant token by clicking your user email at the top right and then choosing "My organization".</p>
                <p>Note however that we have pasted your tenant token in for you in the instructions below.</p>
                </div>
              : null
            }

           
            <h3>Start a virtual device</h3>

            <p>Note that the virtual device will run in the foreground in your terminal, so we recommend running it in a screen session you can detach (just type screen before running the commands below).</p>
            <p>To start a virtual device, just paste the following commands {this.props.hasMultitenancy ? <span>(we have pasted in your specific tenant token)</span> : null }</p>

            {this.props.hasMultitenancy ?
              <div>
                <div className="code">
                <CopyToClipboard text={codeToCopy}
                    onCopy={() => this._copied()}>
                    <FlatButton
                    label="Copy to clipboard"
                    style={{float:"right", margin:"-10px 0 0 10px"}}
                    icon={<FontIcon className="material-icons">content_paste</FontIcon>} />
                </CopyToClipboard>
                <span style={{wordBreak:"break-word"}}>
                 {codeToCopy}
                 </span>
                </div>

                <p>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
              </div>
            : null }

            <p>This will download and run the image for the virtual device. The image is about 500 MB, so be patient if your Internet connection is slow.</p>

            <p>When complete, you will see the virtual device login screen in your terminal. At this point it will take a couple of more minutes before the device will appear in your <a onClick={this.props.changePage.bind(null, "devices")}>Devices tab</a>. Authorize the device to enable you to deploy updates to it.</p>


            <h3>Deploy updates</h3>

            <p>Artifacts for your virtual devices are already uploaded to your account so you can start deploying updates right away. Take a look at the <a onClick={this.props.changePage.bind(null, "artifacts")}>Artifacts tab</a>. If they have been removed, you can download them again from the <a onClick={this.props.changePage.bind(null, "help/connecting-devices/demo-artifacts")}>download page</a>.</p>

            <p>Then head over to the <a onClick={this.props.changePage.bind(null, "deployments")}>Deployments tab</a> and do some deployments to your virtual devices!</p>


            <h3>Manage the virtual device</h3>

            <p>If you started your virtual device in screen, you can keep it running by backgrounding it with Ctrl + A, Ctrl + D. Then you can reconnect to it later with screen -r.</p>
            <p>You may also start more than one virtual device if you want.</p>
            <p>To stop a virtual device after you are done testing, simply switch to its terminal, login as root (no password) and type "shutdown -h now" in its terminal. You can then also decommission it in the Hosted Mender interface.</p>

    
          </div>
        :

        <div>
          <p>A virtual device is bundled with the Mender server to make it easy to test Mender.</p>

          <h3>Prerequisites</h3>
          <p>The test environment should be set up and working successfully as described in the <a href={"https://docs.mender.io/"+this.props.docsVersion+"getting-started/create-a-test-environment"} target="_blank">Install a Mender demo server</a> documention.</p>
          <p>You should also download the virtual Artifacts listed on the <a href={"https://docs.mender.io/"+this.props.docsVersion+"getting-started/download-test-images"} target="_blank">the download page</a>.</p>
        
          <h3>Authorize the device</h3>
          <p>A minute or two after the server has started, there should be a virtual device pending authorization. This means that the Mender client, which runs as a daemon on the device, 
          is asking to join the Mender server so that the server can manage its deployments.</p>
          <p>You can view and authorize pending devices on the <a onClick={this.props.changePage.bind(null, "devices")}>Devices tab</a>.</p>
        </div>
      }
      </div>
    )
  }
});


module.exports = VirtualDevice;
