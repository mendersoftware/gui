import React from 'react';

// material ui
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;

var UpdateButton = React.createClass({
  render: function() {
    return (
      <RaisedButton label="Deploy update "/>
    );
  }
});

module.exports = UpdateButton;