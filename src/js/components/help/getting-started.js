import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class GettingStarted extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {

    return (
      <div>
        <h2>Getting Started</h2>
        <p>Your devices first need to have the Mender client running on them in order to connect to the server. 
          <br/>There are two approaches to this, depending on what kind of updates you want to do:</p>

        <ul>
          <li>
            <p>For partial updates such as application updates, you can install Mender on your device as a .deb package. 
            This is the quickest and easiest way to get started with Mender.</p>
            <p>Get started here: <Link to={`/help/application-updates/mender-deb-package`}>How to connect your device using .deb package</Link></p>
          </li>

          <li className="margin-top">
            <p>
              The most robust and reliable approach is full rootfs system updates. 
              For this, the Mender client needs to be integrated as part of the disk image, which can be done by building with Yocto or converting an existing Debian disk image. 
              This approach also enables support for partial updates, but there are some device partition layout requirements.
            </p>
            <p>The <Link to={`/help/system-updates`}>System updates section</Link> has several help pages to get you started enabling and connecting your devices for system updates.</p>
          </li>
        </ul>
      
      </div>
    );
  }
}
