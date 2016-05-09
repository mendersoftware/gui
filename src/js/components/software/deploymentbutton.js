import React from 'react';

// material ui
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;

var DeploymentButton = React.createClass({
  render: function() {
    return (
      <RaisedButton label="Deploy update "/>
    );
  }
});

module.exports = DeploymentButton;