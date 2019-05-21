import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class ApplicationUpdates extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {

    return (
      <div>
        <h2>Application Updates</h2>

        <p>Learn how to get started quickly with Application updates:</p>
        <ul>
          <li><p><Link to={`/help/application-updates/mender-deb-package`}>Connect devices with .deb package</Link></p></li>
          <li><p><Link to={`/help/application-updates/demo-virtual-device`}>Connect a virtual device for demo/testing purposes</Link></p></li>
          <li><p><Link to={`/help/application-updates/update-modules`}>Enabling different kinds of updates with update modules</Link></p></li>
        </ul>

        
        <p>For more robust and reliable updates, <Link to={`/help/system-updates`}>learn about Mender’s System updates</Link>, which we recommend for production.</p>

      </div>
    );
  }
}
