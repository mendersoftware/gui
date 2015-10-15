var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var mui = require('material-ui');
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var Dialog = mui.Dialog;
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var Snackbar = mui.Snackbar;

var addSelection = {};

var SelectedNodes = React.createClass({
  getInitialState: function() {
    return {
      showInput: false 
    };
  },
  _onDismiss: function() {
    console.log("gone");
  },
  _handleSelectValueChange: function(e) {
    this.setState({showInput: false});

    var group = '';
    for (var i=0;i<this.props.groups.length;i++) {
      if (this.props.groups[i].id === e.target.value) {
        group = this.props.groups[i];
      }
    }
    addSelection = {
      group: group,
      textFieldValue: e.target.value 
    };
  },
  dialogDismiss: function(ref) {
    this.refs[ref].dismiss();
  },
  dialogOpen: function(ref) {
    this.refs[ref].show();
  },
  _showButton: function() {
    this.setState({showInput: true});
  },
  _addGroupHandler: function() {
    AppActions.addToGroup(addSelection.group, this.props.selected);
    this.dialogDismiss('addGroup');
    AppActions.selectGroup(addSelection.textFieldValue);
  },
  _removeGroupHandler: function() {
    AppActions.addToGroup(this.props.selectedGroup, this.props.selected);
  },
  _newGroupHandler: function() {
    var newGroup = this.refs['customGroup'].getValue();
    newGroup = {
      name: newGroup,
      nodes: []
    };
    addSelection = {
      group: newGroup,
      textFieldValue: null 
    };

    // TODO update so gets added to props + select list 

    this.setState({showInput: false});
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
    var hideInfo = {display: "none"};
    var nodeInfo ='';
    var hideRemove = this.props.selectedGroup.id === 1 ? {visibility: "hidden"} : {visibility: "visible"};
    var disableAction = this.props.selected.length ? false : true;
    var inputStyle = {
      display: "inline-block",
      marginRight: "30px"
    }

    if (this.props.selected.length === 1) {
      hideInfo = {display: "block"};
      nodeInfo = (
        <ul>
          <li>Name: {this.props.selected[0].name}</li>
          <li>Status: {this.props.selected[0].status}</li>
          <li>Model: {this.props.selected[0].model}</li>
          <li>Software: {this.props.selected[0].software_version}</li>
          <li>Architecture: {this.props.selected[0].arch}</li>
          <li>Groups: {this.props.selected[0].groups.join(',')}</li>
        </ul>
      )
    }
    var nodes = this.props.selected.map(function(node) {
      return (
        <p>{node.name}</p>
      )
    })

    var addActions = [
      { text: 'Cancel', onClick: this.dialogDismiss.bind(null, 'addGroup')},
      { text: 'Add to group', onClick: this._addGroupHandler, ref: 'save' }
    ];

    var groupList = this.props.groups.map(function(group) {
      if (group.id === 1) {
        return {payload: '', text: ''}
      } else {
        return {payload: group.id, text: group.name}
      }
    });

    return (
      <div className="tableActions">
        <div>
          <span style={{marginRight:"30px"}}>{nodes.length} nodes selected</span>
          <FlatButton disabled={disableAction} label="Add selected nodes to a group" secondary={true} onClick={this.dialogOpen.bind(null, 'addGroup')} />
          <FlatButton disabled={disableAction} style={hideRemove} label="Remove selected nodes from this group" secondary={true} onClick={this._removeGroupHandler} />
        </div>
        <div className="nodeInfo" style={hideInfo}>
          {nodeInfo}
        </div>

        <Dialog
          ref="addGroup"
          title="Add nodes to group"
          actions={addActions}
          actionFocus="submit"
          autoDetectWindowHeight={true} autoScrollBodyContent={true}>  
          <div style={{height: '200px'}}>
            <div>
              <SelectField
              ref="groupSelect"
              onChange={this._handleSelectValueChange}
              floatingLabelText="Select group"
              menuItems={groupList} 
              style={inputStyle} />
              
              <RaisedButton 
                label="New group" 
                onClick={this._showButton}/>
            </div>

            <div className={this.state.showInput ? null : 'hidden'}>
              <TextField
                ref="customGroup"
                hintText="Group name"
                floatingLabelText="Group name"
                style={inputStyle}
                onChange={this._validateName}
                errorText={this.state.errorText1} />
            
              <RaisedButton tooltip="save" onClick={this._newGroupHandler} >Save</RaisedButton>
            </div>
          </div>
        </Dialog>

        <Snackbar 
          onDismiss={this._onDismiss}
          ref="snackbar"
          autoHideDuration={5000}
          action="undo"
          message="Nodes added to group" />

          <Snackbar 
          onDismiss={this._onDismiss}
          ref="snackbarRemove"
          autoHideDuration={5000}
          action="undo"
          message="Nodes were removed from the group"
          onActionTouchTap={this._undoRemove} />
      </div>
    );
  }
});

module.exports = SelectedNodes;