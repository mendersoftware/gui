var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;

var NodeList = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    return nextProps.nodes !== this.props.nodes;
  },
  _onRowSelection: function(rows) {
    if (rows === "all") {
      rows = [];
      for (var i=0; i<this.props.nodes.length;i++) {
        rows.push(i);
      }
    }
    AppActions.selectNodes(rows);
  },
  _selectAll: function(rows) {
    console.log("select all", rows);
  },
  render: function() {
    var nodes = this.props.nodes.map(function(node) {
      return (
        <TableRow key={node.id}>
          <TableRowColumn>{node.name}</TableRowColumn>
          <TableRowColumn>{node.model}</TableRowColumn>
          <TableRowColumn>{node.software_version}</TableRowColumn>
          <TableRowColumn>{node.status}</TableRowColumn>
        </TableRow>
      )
    })
    return (
      <Table
        onRowSelection={this._onRowSelection}
        multiSelectable={true}>
        <TableHeader
        enableSelectAll={true}
        onSelectAll={this._selectAll}>
          <TableRow>
            <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
            <TableHeaderColumn tooltip="Model">Model</TableHeaderColumn>
            <TableHeaderColumn tooltip="Installed software">Software</TableHeaderColumn>
            <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          deselectOnClickaway={false}>
          {nodes}
        </TableBody>
      </Table>
    );
  }
});

module.exports = NodeList;