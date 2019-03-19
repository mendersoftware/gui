import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
var Loader = require('../common/loader');
var createReactClass = require('create-react-class');

var ConfirmAbort = createReactClass({
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
      <div className={this.state.class} style={{marginRight:"12px"}}>
        <div className="float-right">
          <span className="bold">{this.state.loading ? "Aborting..." : "Confirm abort deployment?"}</span>
          <IconButton id="confirmAbort" style={styles} onClick={this._handleAbort}>
            <FontIcon className="material-icons green">check_circle</FontIcon>
          </IconButton>
          <IconButton id="cancelAbort" style={styles} onClick={this._handleCancel}>
            <FontIcon className="material-icons red">cancel</FontIcon>
          </IconButton>
        </div>
      </div>
    )
  }
});

module.exports = ConfirmAbort;