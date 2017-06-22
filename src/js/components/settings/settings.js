import React from 'react';
import { Router, Route} from 'react-router';
import cookie from 'react-cookie';
import UserManagement from '../user-management/usermanagement';
var createReactClass = require('create-react-class');
var AppStore = require('../../stores/app-store');

// material ui
import { List, ListItem } from 'material-ui/List';
import Snackbar from 'material-ui/Snackbar';
import Subheader from 'material-ui/Subheader';

function getState() {
  return {
    snackbar: AppStore.getSnackbar()
  };
}

var Settings =  createReactClass({
  getInitialState: function() {
     return getState();
  },

  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },

  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(getState());
  },

  render: function() {
    return (
      <div className="margin-top">
        <div className="leftFixed">
          <List>
            <Subheader>Settings</Subheader>
            <ListItem 
              primaryText="User management"
              style={{backgroundColor: "#e7e7e7"}} />
          </List>
        </div>
        <div className="rightFluid padding-right">
          <UserManagement />
        </div>

        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={8000} 
        />
      </div>
    )
  }

});

module.exports = Settings;
