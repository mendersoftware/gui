import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
var Loader = require('../common/loader');

var ConfirmAbort = React.createClass({
  getInitialState: function() {
    return {
      class: "fadeIn"
    };
  },
  _handleCancel: function() {
    this.setState({class: "fadeOut"});
    this.props.cancel();
  },
  _handleAbort: function() {
    this.setState({loading:true});
    this.props.abort();
  },
  render: function() {
    var styles = {
      padding: "0",
      marginLeft:"12px",
      marginRight:"-24px",
      verticalAlign:"middle"
    }
    return (
      <div className={this.state.class}>
        
        {this.state.loading ? "Aborting..." : "Abort the deployment?"}
        <IconButton style={styles} onClick={this._handleAbort}>
          <FontIcon className="material-icons green">check_circle</FontIcon>
        </IconButton>
        <IconButton style={styles} onClick={this._handleCancel}>
          <FontIcon className="material-icons red">cancel</FontIcon>
        </IconButton>
        
      </div>
    )
  }
});

module.exports = ConfirmAbort;