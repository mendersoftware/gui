import React from 'react';
var createReactClass = require('create-react-class');

// material ui
import FontIcon from 'material-ui/FontIcon';

var DeploymentNotifications = createReactClass({
 
  render: function() {
    
    return (
      <div className="header-section">
        <span>{this.props.deploymentsInProgress}</span>
        <FontIcon style={{color: '#c7c7c7', margin: '0 7px', top: '5px', fontSize: '20px'}} className="material-icons flip-horizontal">refresh</FontIcon>
      </div>
    );
  }
});

module.exports = DeploymentNotifications;