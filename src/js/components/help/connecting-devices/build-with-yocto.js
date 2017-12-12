import React from 'react';
import PropTypes from 'prop-types';

var createReactClass = require('create-react-class');

var BuildYocto =  createReactClass({
 
  render: function() {

    var token = (this.props.org || {}).tenant_token;

    return (
      <div>

        <h2>Build with Yocto</h2>
        <p>You can build disk images and Artifacts with any software of your choosing that support Mender for any device with the Mender Yocto Project integration.</p>

        <p>Follow the docs at <a href="https://docs.mender.io/artifacts/building-mender-yocto-image">https://docs.mender.io/artifacts/building-mender-yocto-image</a> to get your .sdimg and .mender files.</p>

        <p>Make sure to update the local.conf build configuration:</p>

       <p>You should not be using the `meta-mender-demo layer`. If you have it in your build environment, you need to remove it.</p>
        <p>In order to remove the meta-mender-demo layer, go to your `build` directory and type run the following command:</p>

        <div className="code">
        bitbake-layers remove-layer ../meta-mender/meta-mender-demo
        </div>

        <p>Add or replace the following two lines in your `local.conf`:</p>

        <div className="code">
        <p>MENDER_SERVER_URL = "https://hosted.mender.io"</p>
        <p>MENDER_TENANT_TOKEN = "{token}"</p>
        </div>

        <p>You can the use the output .sdimg and .mender files to connect to your Mender server and deploy updates, as outlined <a href="https://docs.mender.io/artifacts/building-mender-yocto-image">in the tutorial</a>.</p>
      </div>
    )
  }
});


module.exports = BuildYocto;