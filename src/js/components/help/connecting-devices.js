import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class ConnectingDevices extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {
    var links = [];
    var list = (this.props.pages || {})['connecting-devices'];
    var toplevel = '';
    function eachRecursive(list, level) {
      for (var k in list) {
        // fix link for nested levels
        toplevel = level > 0 ? toplevel : k;
        var relative_path = level > 0 ? `${toplevel}/${k}` : k;
        if (typeof list[k] == 'object' && list[k] !== null && k !== 'component') {
          links.push(
            <p key={k} style={{ paddingLeft: level * 16 }}>
              <Link to={`connecting-devices/${relative_path}`}>{list[k].title}</Link>
            </p>
          );
          eachRecursive(list[k], level + 1);
        }
      }
    }
    eachRecursive(list, 0);

    return (
      <div>
        <h2>Connecting devices</h2>
        <p>Learn how to connect devices to the Mender server.</p>

        <div style={{ margin: '10px 0' }}>
          <p>Topic pages:</p>
          {links}
        </div>

        <p className="note" style={{ marginTop: '60px' }}>
          NOTE: there are security implications to connecting a client and server for the first time, also known as <i>bootstrapping</i>. If a client and server
          have not exchanged any information in advance, they need to accept each other on trust this first time, with the risk that the information the other
          party presents is spoofed. To mitigate this risk, the Mender client preinstalls the TLS certificate of the server when it is provisioned, as part of
          the Yocto Project image build. So it is not possible for a rogue server to intercept the connection from a client or pretend to be a different server,
          assuming server's private TLS key is securely managed. A rogue device can still spoof the information it sends to the server in order to be
          authorized, and this is why Mender asks you to make the authorization decision. However, the risk of letting the server manage a rogue device is much
          lower than the risk of a rogue server managing devices.
        </p>
      </div>
    );
  }
}
