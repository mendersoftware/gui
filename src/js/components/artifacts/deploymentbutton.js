import React from 'react';
var createReactClass = require('create-react-class');

// material ui
import RaisedButton from 'material-ui/RaisedButton';

var DeploymentButton = createReactClass({
  render: function() {
    return (
      <RaisedButton label="Create deployment"/>
    );
  }
});

module.exports = DeploymentButton;