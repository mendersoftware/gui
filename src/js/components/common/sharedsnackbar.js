
import React from 'react';
var createReactClass = require('create-react-class');
var AppActions = require('../../actions/app-actions');
import Snackbar from 'material-ui/Snackbar';
import copy from 'copy-to-clipboard';

var SharedSnackbar = createReactClass({

    handleActionClick: function() {
    copy(this.props.snackbar.message);
    AppActions.setSnackbar("Copied to clipboard");
  },

  handleRequestClose: function() {
    AppActions.setSnackbar("");
  },

  render: function() {
   
    return (
      
        <Snackbar
          open={this.props.snackbar.open}
          message={this.props.snackbar.message}
          autoHideDuration={this.props.snackbar.autoHideDuration}
          action={this.props.snackbar.action}
          bodyStyle={{ maxWidth: this.props.snackbar.maxWidth, height: 'auto', lineHeight: '28px', padding: 24, whiteSpace: 'pre-line' }}
          onActionTouchTap={this.handleActionClick}
          onRequestClose={this.handleRequestClose}
         />
    );
  }

});

module.exports = SharedSnackbar;     

