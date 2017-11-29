import React from 'react';
import { Router, Link } from 'react-router';
import PropTypes from 'prop-types';
import { toggleHelptips } from '../../utils/togglehelptips';
var pluralize = require('pluralize');
var createReactClass = require('create-react-class');
var AppStore = require('../../stores/app-store');

var ReviewDevices = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Getting started</h3>
        <hr/>
        <p>If this is the first time you've used Mender, we have provided a virtual device for you to create a test deployment.</p>
        <p>{this.props.devices} {pluralize("devices", this.props.devices)} {pluralize("are", this.props.devices)} waiting to be authorized by you. Click <Link to={`/devices`}>'Review details'</Link> to see the {pluralize("devices", this.props.devices)} which {pluralize("are", this.props.devices)} requesting to be accepted.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var AuthDevices = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Authorize devices</h3>
        <hr/>
        <p>There {this.props.devices === 1 ? "is a" : "are" } {pluralize("devices", this.props.devices)} waiting to be authorized.</p>
        <p>This means that the Mender client, which runs as a daemon on each device, is asking to join the Mender server so that the server can manage its deployments.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var ExpandAuth = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Review device details</h3>
        <hr/>
        <p>You can review each device before authorizing it to join the server.</p>
        <p>Click to expand the row to view further information about the device's identity.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var AuthButton = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Authorize devices</h3>
        <hr/>
        <p>When you are ready, click to <b>authorize</b> the {pluralize("devices", this.props.devices)}.</p>
        <p>Read more about bootstrapping devices to the server in <a href="https://docs.mender.io/getting-started/deploy-to-virtual-devices#authorize-the-device">our documentation</a>.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var AddGroup = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Device groups</h3>
        <hr/>
        <p>It is possible to create groups of devices. Once you have created a group and added one or more devices to it, you can deploy an update to that specific group only.</p>
        <p>To avoid accidents, Mender only allows a device to be in one group at the time.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var ExpandDevice = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Device inventory</h3>
        <hr/>
        <p>Mender automatically collects identity and inventory information from connected devices. You can view this information by clicking on a device to expand the row.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var DevicesNav = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Devices</h3>
        <hr/>
        <p>There {this.props.devices === 1 ? "is a device" : "are devices"} waiting to be connected to the Mender server. Before you can manage any deployments, you must first authorize devices that are requesting to join.</p>
        <p>Go to the <Link to={`/devices`}>Devices tab</Link> to add devices to the server.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var ArtifactsNav = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Artifacts</h3>
        <hr/>
        <p>Before we can create a deployment, an Artifact needs to be uploaded to the Mender server.</p>
        <p>Go to the <Link to={`/artifacts`}>Artifacts tab</Link>.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var DeploymentsNav = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Create a Deployment</h3>
        <hr/>
        <p>Looks like you're ready to make your first deployment!</p>
        <p>You have connected {this.props.devices===1 ? "a device" : "devices"} to your server and uploaded an Artifact, so now go to the <Link to={`/deployments`}>Deployments tab</Link> to create a deployment.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var UploadArtifact = createReactClass({
  render: function () {
    var multitenancy = AppStore.hasMultitenancy();
    return (
      <div>
        <h3>Upload an Artifact</h3>
        <hr/>
        <p>Before we can deploy an update to devices, we need to upload an Artifact. A Mender Artifact is a file format that includes some metadata and the root file system that is to be deployed. Steps to build an Artifact are <a href="https://docs.mender.io/artifacts/building-mender-yocto-image">provided in our documentation</a>.</p>
        { !multitenancy ? 
          <p>To make testing easier, you can <a href="https://docs.mender.io/getting-started/deploy-to-virtual-devices#upload-a-new-mender-artifact-to-the-server">download a test Mender Artifact</a> for your virtual devices. After the download finishes, upload the Artifact.</p> :
          null}
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var ExpandArtifact = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Device type compatibility</h3>
        <hr/>
        <p>Mender Artifacts have <b>Device types compatible</b> as part of their metadata. All devices report which device type they are as part of their inventory information. During a deployment, Mender makes sure that a device will only get and install an Artifact it is compatible with.</p>
        <p>You can click on each Artifact to expand the row and view more information about it.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var CreateDeployment = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Create a deployment</h3>
        <hr/>
        <p>This is where you will track the progress of your deployments.</p>

        { this.props.artifacts && this.props.devices ?
        <p>Looks like you're ready to make your first deployment - you have {this.props.devices===1 ? "a device" : "devices"} connected to the server and an Artifact ready to deploy to them. Click <b>Create a deployment</b>.</p>
        : this.props.devices ? 
        <p>You're not quite ready to make your first deployment yet - you have {this.props.devices===1 ? "a device" : "devices"} connected to the server, but no Artifact uploaded. Go to the <Link to={`/artifacts`}>Artifacts tab</Link>.</p>
        :
        <p>You're not quite ready to make your first deployment yet - there are no devices connected to the server. Go to the <Link to={`/devices`}>Devices tab</Link>.</p>
        }
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var CreateDeploymentForm = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Creating a deployment</h3>
        <hr/>
        <p>A deployment needs to know which Artifact to deploy, and which group of devices to deploy it to.</p>
        <p>Select an Artifact and a device group containing devices of a type compatible with the selected Artifact. You can see how many devices will be updated in the deployment. When ready, <b>Create deployment</b>.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});


var ProgressDeployment = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Tracking deployment progress</h3>
        <hr/>
        <p>In this row you can see the deployment's status at a glance.</p>
        <p>As the deployment progresses, you can click to see a more detailed view of the deployment progress broken down by individual device.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var FinishedDeployment = createReactClass({
  render: function () {
    return (
      <div>
        <h3>Deployment reports</h3>
        <hr/>
        {this.props.success ? 
          <p>Congratulations, you have used Mender to deploy your first managed update!</p>
          :
          <p>When deployments have completed, you can see them here.</p>
        }
        
        <p>Clicking the row will open a more detailed report.</p>
        <p>If you were using the test virtual device, you should now <a href="https://docs.mender.io/getting-started/deploy-to-physical-devices">visit our documentation for more about deploying to physical devices</a>.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

var NoDevices = createReactClass({
  render: function () {
    return (
      <div>
        <h3>No devices found</h3>
        <hr/>
        <p>There aren't any devices connected to or requesting to join the Mender server.</p>
        <p>If you don't see any test devices, or if you have a physical device you'd like to connect, <a href="https://docs.mender.io/getting-started">read our getting started guide for help</a>.</p>
        <p><a className="hidehelp" onClick={toggleHelptips}>Hide all help tips</a></p>
      </div>
    )
  }
});

module.exports.contextTypes = {
  router: PropTypes.object,
};

module.exports = {
  ReviewDevices,
  AuthDevices,
  ExpandAuth,
  AuthButton,
  AddGroup,
  ExpandDevice,
  DevicesNav,
  ArtifactsNav,
  DeploymentsNav,
  UploadArtifact,
  ExpandArtifact,
  CreateDeployment,
  CreateDeploymentForm,
  ProgressDeployment,
  FinishedDeployment,
  NoDevices
}

