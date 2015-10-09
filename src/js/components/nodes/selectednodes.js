var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var mui = require('material-ui');
var FlatButton = mui.FlatButton;
var Dialog = mui.Dialog;
var SelectField = mui.SelectField;
var Snackbar = mui.Snackbar;

var addSelection = {};

var SelectedNodes = React.createClass({
  _onDismiss: function() {
    console.log("gone");
  },
  _handleSelectValueChange: function(e) {
    var group = this.props.groups[e.target.value];
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
  _addGroupHandler: function() {
    AppActions.addToGroup(addSelection.textFieldValue, this.props.selected);
    this.dialogDismiss('addGroup');
    AppActions.selectGroup(addSelection.textFieldValue);
  },

  render: function() {
    var hideInfo = {display: "none"};
    var nodeInfo ='';
    var hideRemove = this.props.selectedGroup === 1 ? {visibility: "hidden"} : {visibility: "visible"};
    var disableAction = this.props.selected.length ? false : true;

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
      { text: 'Save group', onClick: this._addGroupHandler, ref: 'save' }
    ];

    var groupList = this.props.groups.map(function(group) {
      if (group.id === 1) {
        return {payload: '', text: ''}
      } else {
        return {payload: group.id, text: group.name}
      }
    });
    groupList
    return (
      <div className="tableActions">
        <div>
          <span style={{marginRight:"30px"}}>{nodes.length} nodes selected</span>
          <FlatButton disabled={disableAction} label="Add selected nodes to a group" secondary={true} onClick={this.dialogOpen.bind(null, 'addGroup')} />
          <FlatButton disabled={disableAction} style={hideRemove} label="Remove selected nodes from this group" secondary={true} />
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
              <SelectField
              ref="groupSelect"
              onChange={this._handleSelectValueChange}
              floatingLabelText="Select group"
              menuItems={groupList} />
          < /div>
        </Dialog>

        <Snackbar 
          onDismiss={this._onDismiss}
          ref="snackbar"
          autoHideDuration={5000}
          action="undo"
          message="Nodes added to group" />
      </div>
    );
  }
});

module.exports = SelectedNodes;