import React from 'react';
import PropTypes from 'prop-types';

var createReactClass = require('create-react-class');

var IntegrateDebian =  createReactClass({

  render: function() {

    return (
      <div>

        <h2>Integrate with Debian family</h2>

        
        <p>If you'd like to integrate a board with the Debian family of OSes - for example Debian, Ubuntu, or Raspbian - you can use our <span className="code">mender-convert</span> utility to convert existing disk images for use with Mender. <a href={"https://docs.mender.io/"+this.props.docsVersion+"artifacts/debian-family"} target="_blank">Read our documentation</a> on building a Mender Debian image.</p>
        <p>You can also look in the <a href="https://hub.mender.io/c/board-integrations/debian-family" target="_blank">Debian family category on Mender Hub</a> to find if your board or a similar board has been tested.</p>

      </div>
    )
  }
});


module.exports = IntegrateDebian;
