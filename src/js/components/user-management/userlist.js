import React from 'react';
var createReactClass = require('create-react-class');

var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
import Time from 'react-time';

// material ui

var mui = require('material-ui');
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
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
          <TableRowColumn>
            {user.email}
          </TableRowColumn>
          <TableRowColumn numeric>
            <Time value={user.created_ts} format="YYYY-MM-DD HH:mm" />
          </TableRowColumn>
          <TableRowColumn numeric>
            <Time value={user.updated_ts} format="YYYY-MM-DD HH:mm" />
          </TableRowColumn>
          <TableRowColumn disablePadding>
            <FlatButton label="Edit" onClick={this._handleEdit.bind(this, user)} />
            {this.props.currentUser.id !== user.id ? <FlatButton label="Remove" onClick={this._handleRemove.bind(this, user)} /> : null }
          </TableRowColumn>
        </TableRow>
      );
    }.bind(this));

    return (

      <div className="margin-top-small">
        <div style={{marginLeft: "20px"}}>
          <h2 style={{marginTop: "15px"}}>Users</h2>
        </div>
        <div className="margin-bottom">
          <Table selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                {columnData.map(column => {
                  return (
                    <TableHeaderColumn
                      key={column.id}
                      disablePadding={column.disablePadding}
                    >
                      
                        {column.label}
                      
                    </TableHeaderColumn>
                  );
                }, this)}
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}>
              {users}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

});

module.exports = UserList;
