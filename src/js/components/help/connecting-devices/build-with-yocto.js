import React from 'react';
import PropTypes from 'prop-types';

var createReactClass = require('create-react-class');

import CopyToClipboard from 'react-copy-to-clipboard';

import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

var BuildYocto =  createReactClass({

  getInitialState: function() {
    return {
      copied1: false,
      copied2: false,
    };
  },

  _copied: function(ref) {
    var self = this;
    var toSet = {};
    toSet[ref] = true;
    self.setState(toSet);
    setTimeout(function() {
      toSet[ref] = false;
      self.setState(toSet);
    }, 5000);
  },
 
  render: function() {

    var token = (this.props.org || {}).tenant_token;
    var codeToCopy1 = "bitbake-layers remove-layer ../meta-mender/meta-mender-demo";
    var codeToCopy2 = "MENDER_SERVER_URL = 'https://hosted.mender.io' \nMENDER_TENANT_TOKEN = '" + token + "'";

    return (
      <div>

        <h2>Build with Yocto</h2>
        <p>You can build your own Yocto Project images for use with Mender. By updating a small part of your build configuration, your newly provisioned devices will securely connect to the Mender server the first time they boot.</p>

        <p>Follow the docs at <a href={"https://docs.mender.io/"+this.props.docsVersion+"/artifacts/building-mender-yocto-image"}>https://docs.mender.io/{this.props.docsVersion}/artifacts/building-mender-yocto-image</a> to build your .sdimg and .mender files.</p>

        
        {this.props.isHosted ? 
        
        <div>
          <p>Do the following steps to integrate your build with Hosted Mender:</p>

          <h3>Remove demo layer if used</h3>

          <p>You should not be using the <span className="code">meta-mender-demo layer</span>. If you have it in your build environment, you need to remove it.</p>
          <p>Go to your <span className="code">build</span> directory and run the following command:</p>

          <div className="code">
              <CopyToClipboard text={codeToCopy1}
                onCopy={() => this._copied("copied1")}>
                <FlatButton
                label="Copy to clipboard"
                style={{float:"right", margin:"-10px 0 0 10px"}}
                icon={<FontIcon className="material-icons">content_paste</FontIcon>} />
              </CopyToClipboard>
              <span style={{wordBreak:"break-word"}}>
              {codeToCopy1}
              </span>
          </div>
         
          <p>{this.state.copied1 ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>

          <h3>Update local.conf for Hosted Mender</h3>

          <p>Add or replace the following two lines in your <span className="code">local.conf</span>:</p>

            <div className="code">
              <CopyToClipboard text={codeToCopy2}
                onCopy={() => this._copied("copied2")}>
                <FlatButton
                label="Copy to clipboard"
                style={{float:"right", margin:"-10px 0 0 10px"}}
                icon={<FontIcon className="material-icons">content_paste</FontIcon>} />
              </CopyToClipboard>
              <span style={{wordBreak:"break-word"}}>
                {codeToCopy2}
              </span>
            </div>

            <p>{this.state.copied2 ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>

            <p>You can the use the output .sdimg and .mender files to connect to your Mender server and deploy updates, as outlined <a href={"https://docs.mender.io/"+this.props.docsVersion+"/artifacts/building-mender-yocto-image"} target="_blank">in the tutorial</a>.</p>
          </div>
          
          :

          null

        }
   
        
      </div>
    )
  }
});


module.exports = BuildYocto;
