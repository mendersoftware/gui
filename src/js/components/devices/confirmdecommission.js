import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
var Loader = require('../common/loader');
var createReactClass = require('create-react-class');

var ConfirmDecommission = createReactClass({
  getInitialState: function() {
    return {
      class: "fadeIn"
    };
  },
  _handleCancel: function() {
    this.setState({class: "fadeOut"});
    this.props.cancel();
  },
  _handleDecommission: function() {
    this.setState({loading:true});
    this.props.decommission();
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
          <span className="bold">{this.state.loading ? "Decommissioning " : "Decommission this device and remove all of its data from the server. This cannot be undone. Are you sure?"}</span>
     
          {this.state.loading ? <Loader table={true} waiting={true} show={true} style={{height:"4px", marginLeft:"20px"}} /> :
           
            <div className="inline-block">
              <IconButton id="ConfirmDecommission" style={styles} onClick={this._handleDecommission}>
                <FontIcon className="material-icons green">check_circle</FontIcon>
              </IconButton>
              <IconButton id="cancelDecommission" style={styles} onClick={this._handleCancel}>
                <FontIcon className="material-icons red">cancel</FontIcon>
              </IconButton>
            </div>
          }
        </div>
      </div>
    )
  }
});

module.exports = ConfirmDecommission;