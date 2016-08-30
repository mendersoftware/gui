import React from 'react';

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

var EventLog = React.createClass({
  render: function() {
    return (
      <div>
        <p className="italic">... Coming soon ...</p>
        <div>
          <FlatButton label="Flat neutral" /><div style={{width:"20px", display:"inline-block"}} />
          <FlatButton label="Flat secondary" secondary={true} /><div style={{width:"20px", display:"inline-block"}} />
          <FlatButton label="Flat primary" primary={true} />
        </div>
        <div>
          <FlatButton label="Flat neutral" /><div style={{width:"20px", display:"inline-block"}} />
          <FlatButton label="Flat secondary" secondary={true} /><div style={{width:"20px", display:"inline-block"}} />
          <FlatButton label="Flat primary" primary={true} />
        </div>
        <div className="margin-top">
          <RaisedButton label="Raised neutral" /><div style={{width:"20px", display:"inline-block"}} />
          <RaisedButton label="Raised secondary" secondary={true} /><div style={{width:"20px", display:"inline-block"}} />
          <RaisedButton label="Raised primary" primary={true} />
        </div>
        <div className="margin-top">
          <RaisedButton label="Raised neutral" /><div style={{width:"20px", display:"inline-block"}} />
          <RaisedButton label="Raised secondary" secondary={true} /><div style={{width:"20px", display:"inline-block"}} />
          <RaisedButton label="Raised primary" primary={true} />
        </div>
      </div>
    );
  }
});

module.exports = EventLog;