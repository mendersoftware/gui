import React from 'react';
import PropTypes from 'prop-types';
var AppStore = require('../../../stores/app-store');

var createReactClass = require('create-react-class');



var VirtualDevice =  createReactClass({
 
  render: function() {

    var token = (this.props.org || {}).tenant_token;

    return (

   

        <div>

          <h2>Virtual device</h2>

          {this.props.isHosted ?

          <div>

            <p>Mender supports virtual devices, which is handy as you do not need to configure any hardware to try Mender.</p>

            <h3>Prerequisites</h3>

            <h4>Infrastructure to run the virtual device</h4>
            <p>You need to start virtual devices on your own infrastructure (e.g. your workstation or EC2 instance) and connect them to Hosted Mender over the Internet.</p>

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

            <p>Note that the virtual device will run in the foreground in your terminal, so we recommend running it in a screen session you can detach (just type `screen` before running the commands below).</p>
            <p>To start a virtual device, just paste the following commands {this.props.hasMultitenancy ? <span>(we have pasted in your specific tenant token)</span> : null }</p>

            {this.props.hasMultitenancy ?

              <div className="code">
                <p>TENANT_TOKEN='{token}'</p>
                <p>docker run -it -e SERVER_URL="https://hosted.mender.io" \</p>
                <p>-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:1.2.1</p>
              </div>
            : null }

            <p>This will download and run the image for the virtual device. The image is about 500 MB, so be patient if your Internet connection is slow.</p>

            <p>When complete, you will see the virtual device login screen in your terminal. At this point it will take a couple of more minutes before the device will appear in your Devices tab.</p>
    
          </div>
        :

        <div>
          <p>A virtual device is bundled with the Mender server to make it easy to test Mender.</p>

          <h3>Prerequisites</h3>
          <p>The test environment should be set up and working successfully as described in the <a href="https://docs.mender.io/development/getting-started/create-a-test-environment" target="_blank">Install a Mender demo server</a> documention.</p>
          <p>You should also download the virtual Artifacts listed on the <a href="https://docs.mender.io/development/getting-started/download-test-images" target="_blank">the download page</a>.</p>
        
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