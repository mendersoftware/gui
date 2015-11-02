var React = require('react');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;

var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;

var EventLog = React.createClass({
  render: function() {
    return (
      <div>
        <p className="italic">... Coming soon ...</p>
        <div>
          <FlatButton label="Flat neutral" /><div style={{width:"20", display:"inline-block"}} />
          <FlatButton label="Flat secondary" secondary={true} /><div style={{width:"20", display:"inline-block"}} />
          <FlatButton label="Flat primary" primary={true} />
        </div>
        <div>
          <FlatButton label="Flat neutral" /><div style={{width:"20", display:"inline-block"}} />
          <FlatButton label="Flat secondary" secondary={true} /><div style={{width:"20", display:"inline-block"}} />
          <FlatButton label="Flat primary" primary={true} />
        </div>
        <div className="margin-top">
          <RaisedButton label="Raised neutral" /><div style={{width:"20", display:"inline-block"}} />
          <RaisedButton label="Raised secondary" secondary={true} /><div style={{width:"20", display:"inline-block"}} />
          <RaisedButton label="Raised primary" primary={true} />
        </div>
        <div className="margin-top">
          <RaisedButton label="Raised neutral" /><div style={{width:"20", display:"inline-block"}} />
          <RaisedButton label="Raised secondary" secondary={true} /><div style={{width:"20", display:"inline-block"}} />
          <RaisedButton label="Raised primary" primary={true} />
        </div>
      </div>
    );
  }
});

module.exports = EventLog;