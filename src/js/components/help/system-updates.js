import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class SystemUpdates extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {

    return (
      <div>
        <h2>System Updates</h2>
       
        <p>The built-in update mechanism in Mender is dual A/B rootfs updates, meaning the whole system on the device is updated. 
        To enable system updates, the device needs to have an A/B partition layout with the Mender client installed in its disk image.</p> 

        <p>Learn how to enable and connect your devices for system updates:</p>
        <ul>
          <li><p><Link to={`/help/system-updates/board-integrations`}>Supported board integrations on Mender Hub</Link></p></li>
          <li><p><Link to={`/help/system-updates/build-with-yocto`}>Building a Mender-enabled Yocto image</Link></p></li>
          <li><p><Link to={`/help/system-updates/integrate-debian`}>Devices running Debian family OSes</Link></p></li>
        </ul>
        
        <p>You can learn more about Mender&#39;s A&#47;B partition architecture <a href={`https://docs.mender.io/${this.props.docsVersion}architecture/overview`} target="_blank">here</a>.</p>
      </div>
    );
  }
}
