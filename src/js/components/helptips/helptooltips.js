import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toggleHelptips } from '../../utils/toggleuseroptions';
import AppStore from '../../stores/app-store';

export class AuthButton extends React.Component {
  render() {
    return (
      <div style={{ whiteSpace: 'normal' }}>
        <h3>Authorize devices</h3>
        <hr />
        <p>
          Click this button to view the authentication options for this device. You can decide whether to accept it, reject it, or just dismiss this device for
          now.
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
  }
}

export class AddGroup extends React.Component {
  render() {
    return (
      <div>
        <h3>Device groups</h3>
        <hr />
        <p>
          It is possible to create groups of devices. Once you have created a group and added one or more devices to it, you can deploy an update to that
          specific group only.
        </p>
        <p>To avoid accidents, Mender only allows a device to be in one group at the time.</p>
        <p>
          <a className="hidehelp" onClick={toggleHelptips}>
            Hide all help tips
          </a>
        </p>
      </div>
    );
  }
}

export class ExpandDevice extends React.Component {
  render() {
    var docsVersion = AppStore.getDocsVersion() ? `${AppStore.getDocsVersion()}/` : '';
    return (
      <div>
        <h3>Device inventory</h3>
        <hr />
        <p>
          Mender automatically collects identity and inventory information from connected devices. You can view this information by clicking on a device to
          expand the row.
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
  }
}

export class ExpandArtifact extends React.Component {
  render() {
    return (
      <div>
        <h3>Device type compatibility</h3>
        <hr />
        <p>
          Mender Artifacts have <b>Device types compatible</b> as part of their metadata. All devices report which device type they are, as part of their
          inventory information. During a deployment, Mender makes sure that a device will only download and install an Artifact it is compatible with.
        </p>
        <p>You can click on each Artifact in the Release to expand the row and view more information about it.</p>
        <p>
          <a className="hidehelp" onClick={toggleHelptips}>
            Hide all help tips
          </a>
        </p>
      </div>
    );
  }
}

export const contextTypes = {
  router: PropTypes.object
};
