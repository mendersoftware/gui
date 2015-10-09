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
        multiSelectable={true}>
        <TableHeader key={"tableheader"}>
          <TableRow key={1}>
            <TableHeaderColumn key={"name"} tooltip="Name">Name</TableHeaderColumn>
            <TableHeaderColumn key={"model"} tooltip="Model">Model</TableHeaderColumn>
            <TableHeaderColumn key={"software"} tooltip="Installed software">Software</TableHeaderColumn>
            <TableHeaderColumn key={"status"} tooltip="Status">Status</TableHeaderColumn>
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