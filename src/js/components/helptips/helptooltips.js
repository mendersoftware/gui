import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleHelptips } from '../../actions/userActions';

const actionCreators = { toggleHelptips };
const mapStateToProps = state => {
  const docsVersion = state.app.docsVersion ? `${state.app.docsVersion}/` : 'development/';
  return {
    docsVersion: state.app.features.hasMultitenancy && state.app.features.isHosted ? '' : docsVersion
  };
};

const AuthButtonComponent = ({ toggleHelptips }) => (
  <div style={{ whiteSpace: 'normal' }}>
    <h3>Authorize devices</h3>
    <hr />
    <p>
      Click this button to view the authentication options for this device. You can decide whether to accept it, reject it, or just dismiss this device for now.
    </p>
    <p>
      You can find out more about connecting different types of devices in <Link to="/help/getting-started">the help section</Link>.
    </p>
    <p>
      <a className="hidehelp" onClick={toggleHelptips}>
        Hide all help tips
      </a>
    </p>
  </div>
);
export const AuthButton = connect(mapStateToProps, actionCreators)(AuthButtonComponent);

const AddGroupComponent = ({ toggleHelptips }) => (
  <div>
    <h3>Device groups</h3>
    <hr />
    <p>
      It is possible to create groups of devices. Once you have created a group and added one or more devices to it, you can deploy an update to that specific
      group only.
    </p>
    <p>To avoid accidents, Mender only allows a device to be in one group at the time.</p>
    <p>
      <a className="hidehelp" onClick={toggleHelptips}>
        Hide all help tips
      </a>
    </p>
  </div>
);
export const AddGroup = connect(mapStateToProps, actionCreators)(AddGroupComponent);

const ExpandDeviceComponent = ({ docsVersion, toggleHelptips }) => (
  <div>
    <h3>Device inventory</h3>
    <hr />
    <p>
      Mender automatically collects identity and inventory information from connected devices. You can view this information by clicking on a device to expand
      the row.
    </p>
    <p>
      Which information is collected about devices is fully configurable;{' '}
      <a href={`https://docs.mender.io/${docsVersion}client-configuration/identity`} target="_blank">
        see the documentation for how to configure this
      </a>
      .
    </p>
    <p>
      <a className="hidehelp" onClick={toggleHelptips}>
        Hide all help tips
      </a>
    </p>
  </div>
);
export const ExpandDevice = connect(mapStateToProps, actionCreators)(ExpandDeviceComponent);

const ExpandArtifactComponent = ({ toggleHelptips }) => (
  <div>
    <h3>Device type compatibility</h3>
    <hr />
    <p>
      Mender Artifacts have <b>Device types compatible</b> as part of their metadata. All devices report which device type they are, as part of their inventory
      information. During a deployment, Mender makes sure that a device will only download and install an Artifact it is compatible with.
    </p>
    <p>You can click on each Artifact in the Release to expand the row and view more information about it.</p>
    <p>
      <a className="hidehelp" onClick={toggleHelptips}>
        Hide all help tips
      </a>
    </p>
  </div>
);
export const ExpandArtifact = connect(mapStateToProps, actionCreators)(ExpandArtifactComponent);
