
import React from 'react';
var createReactClass = require('create-react-class');
import Snackbar from 'material-ui/Snackbar';

var SharedSnackbar = createReactClass({

  render: function() {
   
    return (
      
	    <Snackbar
	      open={this.props.snackbar.open}
	      message={this.props.snackbar.message}
	      autoHideDuration={8000}
	      bodyStyle={{width:"700px", maxWidth:"700px"}}
	     />
    );
  }

});

module.exports = SharedSnackbar;     

