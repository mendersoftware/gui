import React from 'react';
import mui from 'material-ui';
var FontIcon = mui.FontIcon;
var FileField = require('react-file-input');

var FileInput = React.createClass({
  render: function () {
    return (
      <div>
        <FileField
          id={this.props.id}
          name={this.props.id}
          accept={this.props.accept}
          placeholder={this.props.placeholder}
          className="fileInput"
          style={{zIndex: "2"}}
          onChange={this.props.onchange} />
      </div>
    )
  }
});

module.exports = FileInput;

