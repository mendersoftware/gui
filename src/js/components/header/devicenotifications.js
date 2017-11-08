import React from 'react';
var createReactClass = require('create-react-class');

// material ui
import FontIcon from 'material-ui/FontIcon';

var DeviceNotifications = createReactClass({
 
  render: function() {
    
    return (
      <div className="header-section">
        <span>{this.props.total}</span>
        {this.props.limit ? 
          <span>/{this.props.limit}</span>
        : null }

        <FontIcon style={{color: '#c7c7c7', margin: '0 7px', top: '5px', fontSize: '20px'}} className="material-icons">developer_board</FontIcon>
        {this.props.pending ?
          <a style={{marginLeft: "7px"}}>{this.props.pending} pending</a>
        : null }
      </div>
    );
  }
});

module.exports = DeviceNotifications;