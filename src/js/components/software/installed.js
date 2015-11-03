var React = require('react');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;

var Installed = React.createClass({
  render: function() {
   var items = this.props.software.map(function(pkg, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{pkg.name}</TableRowColumn>
          <TableRowColumn>{pkg.model}</TableRowColumn>
          <TableRowColumn>{pkg.devices}</TableRowColumn>
        </TableRow>
      )
    });
    return (
      <div>
        <div> 
          <Table
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Software">Software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Device type compatibility">Device type compatibility</TableHeaderColumn>
                <TableHeaderColumn tooltip="Number of devices"># Devices</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}>
              {items}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
});

module.exports = Installed;