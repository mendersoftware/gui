import React from 'react';
var createReactClass = require('create-react-class');

var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

import cookie from 'react-cookie';
import Time from 'react-time';

// material ui
import { withStyles, createStyleSheet } from 'material-ui-next-build/styles';
import Table, { TableBody, TableCell, TableHead, TableRow, TableSortLabel } from 'material-ui-next-build/Table';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';


const columnData = [
  { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
  { id: 'created_ts', numeric: true, disablePadding: false, label: 'Date created' },
  { id: 'updated_ts', numeric: true, disablePadding: false, label: 'Last updated' },
  { id: 'actions', numeric: false, disablePadding: false, label: 'Manage' },
];

var UserList =  createReactClass({

  _filter: function(array) {
    var newArray = [];
    for (var i=0; i<array.length;i++) {
      if (AppStore.matchFilters(array[i])) newArray.push(array[i]);
    }
    return newArray;
  },


  _sortColumn: function(col) {
    var direction;
    if (this.state.sortCol !== col) {
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = "sortIcon material-icons";
      ReactDOM.findDOMNode(this.refs[col]).className = "sortIcon material-icons selected";
      this.setState({sortCol:col, sortDown: true});
      direction = true;
    } else {
      direction = !(this.state.sortDown);
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = "sortIcon material-icons selected " +direction;
      this.setState({sortDown: direction});
    }
  },

  _hoverHeader: function (rowNumber, columnId) {

  },

  _handleEdit: function(user, current) {
    this.props.editUser(user, current);
  },
  _handleRemove: function(user) {
    this.props.removeUser(user);
  },

  render: function() {
    var filteredUsers = this._filter(this.props.users);

    var styles = {
      sortIcon: {
        verticalAlign: 'middle',
        marginLeft: "10px",
        color: "#8c8c8d",
        cursor: "pointer",
      },
    }

    var users = filteredUsers.map(function(user, index) {
      return (
        <TableRow 
          key={user.id}
          hover
        >
          <TableCell>
            {user.email}
          </TableCell>
          <TableCell numeric>
            <Time value={user.created_ts} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell numeric>
            <Time value={user.updated_ts} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell disablePadding>
            <FlatButton label="Edit" onClick={this._handleEdit.bind(this, user, user.email === cookie.load("userEmail"))} />
          </TableCell>
        </TableRow>
      );
    }.bind(this));

    return (

      <div className="margin-top">
        <Table>
          <TableHead>
            <TableRow>
              {columnData.map(column => {
                return (
                  <TableCell
                    key={column.id}
                    numeric={column.numeric}
                    disablePadding={column.disablePadding}
                  >
                    <TableSortLabel>
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                );
              }, this)}
            </TableRow>
          </TableHead>
          <TableBody>
            {users}
          </TableBody>
        </Table>
      </div>
    )
  }

});

module.exports = UserList;
