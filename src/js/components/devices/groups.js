import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

// material ui
var mui = require('material-ui');
var List = mui.List;
var ListItem = mui.ListItem;
var ListDivider = mui.ListDivider;
var FontIcon = mui.FontIcon;
var Dialog = mui.Dialog;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;

var Groups = React.createClass({
  getInitialState: function() {
    return {
      errorText1:'' 
    };
  },
  _changeGroup: function(id) {
    AppActions.selectGroup(id);
  },
  _createGroupHandler: function() {
    var newGroup = this.refs['customGroup'].getValue();
    newGroup = {
      name: newGroup,
      devices: [],
      type: 'public'
    };
 
    AppActions.addToGroup(newGroup, []);
    this.dialogDismiss("createGroup");
  },
  dialogDismiss: function(ref) {
    this.refs[ref].dismiss();
  },
  dialogOpen: function(ref) {
    this.refs[ref].show();
  },
  _validateName: function(e) {
    var newName = e.target.value;
    var errorText = null;
    for (var i=0;i<this.props.groups.length; i++) {
      if (this.props.groups[i].name === newName) {
        errorText = "A group with this name already exists";
      }
    }
    this.setState({errorText1: errorText});
  },
  render: function() {
    var createBtn = (
      <FontIcon className="material-icons">add</FontIcon>
    );
    var createActions = [
      <div style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'createGroup')} />
      </div>,
      <RaisedButton
        label="Create group"
        primary={true}
        onClick={this._createGroupHandler} />
    ];
    return (
      <div>
        <List subheader="Groups">
          {this.props.groups.map(function(group) {
            if (group.type==='public') {
              var isSelected = group.id===this.props.selectedGroup.id ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"};
              var boundClick = this._changeGroup.bind(null, group.id);
              var groupLabel = (
                  <span>{group.name}<span className='float-right length'>{group.devices.length}</span></span>
              );
              return (
                <ListItem 
                  key={group.id} 
                  primaryText={groupLabel}
                  style={isSelected}
                  onClick={boundClick} />
              )
            }
          }, this)}
           <ListItem 
            leftIcon={createBtn}
            primaryText="Create a group"
            onClick={this.dialogOpen.bind(null, 'createGroup')} />
        </List>

        <Dialog
          ref="createGroup"
          title="Create a new group"
          actions={createActions}
          actionFocus="submit"
          autoDetectWindowHeight={true} autoScrollBodyContent={true}>  

            <TextField
              ref="customGroup"
              hintText="Group name"
              floatingLabelText="Group name"
              onChange={this._validateName}
              errorStyle={{color: "rgb(171, 16, 0)"}}
              errorText={this.state.errorText1} />
        </Dialog>

      </div>
    );
  }
});


module.exports = Groups;