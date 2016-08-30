import React from 'react';

// material ui
import RaisedButton from 'material-ui/RaisedButton';

var DeploymentButton = React.createClass({
  render: function() {
    return (
      <RaisedButton label="Create deployment"/>
    );
  }
});

module.exports = DeploymentButton;