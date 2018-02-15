import React from 'react';
import PropTypes from 'prop-types';

var createReactClass = require('create-react-class');

var BuildYocto =  createReactClass({
 
  render: function() {

    var token = (this.props.org || {}).tenant_token;

    return (
      <div>

        <h2>Build with Yocto</h2>
        <p>You can build your own Yocto Project images for use with Mender. By updating a small part of your build configuration, your newly provisioned devices will securely connect to the Mender server the first time they boot.</p>

        <p>Follow the docs at <a href="https://docs.mender.io/development/artifacts/building-mender-yocto-image">https://docs.mender.io/development/artifacts/building-mender-yocto-image</a> to build your .sdimg and .mender files.</p>

        
        {this.props.isHosted ? 
        
        <div>
          <p>Make sure to update the local.conf build configuration:</p>

          <h3>Remove demo layer if used</h3>

          <p>You should not be using the <span className="code">meta-mender-demo layer</span>. If you have it in your build environment, you need to remove it.</p>
          <p>Go to your <span className="code">build</span> directory and run the following command:</p>

          <div className="code">
          bitbake-layers remove-layer ../meta-mender/meta-mender-demo
          </div>

          <h3>Update local.conf for Hosted Mender</h3>

          <p>Add or replace the following two lines in your <span className="code">local.conf</span>:</p>

            <div className="code">
              <p>MENDER_SERVER_URL = "https://hosted.mender.io"</p>
              <p>MENDER_TENANT_TOKEN = "{token}"</p>
            </div>

            <p>You can the use the output .sdimg and .mender files to connect to your Mender server and deploy updates, as outlined <a href="https://docs.mender.io/development/artifacts/building-mender-yocto-image" target="_blank">in the tutorial</a>.</p>
          </div>
          
          :

          null

        }
   
        
      </div>
    )
  }
});


module.exports = BuildYocto;
