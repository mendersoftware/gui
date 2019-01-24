import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class Provision extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {
    var links = [];
    var list = (this.props.pages || {})['connecting-devices']['provision-a-demo'];
    for (var k in list) {
      if (typeof list[k] == 'object' && list[k] !== null && k !== 'component') {
        links.push(
          <p key={k}>
            <Link to={`/help/connecting-devices/provision-a-demo/${k}`}>{list[k].title}</Link>
          </p>
        );
      }
    }
    return (
      <div>
        <h2>Provision a demo device</h2>
        <p>
          For demo and testing purposes, we provide pre-built demo images for the Raspberry Pi 3 and BeagleBone Black devices with the latest version of Mender.
        </p>
        <p>
          We also include a virtual device for you to test with, which is handy because it means that you can test Mender without having to configure any
          hardware.
        </p>

        <p>Learn how to provision a:</p>
        {links}
      </div>
    );
  }
}
