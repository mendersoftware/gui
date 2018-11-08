import React from 'react';
var createReactClass = require('create-react-class');

var Loader = createReactClass({
  render: function () {
    var hideClass = this.props.fade ? "hidden" : "loaderContainer shrunk";
    var showClass = this.props.table ? "miniLoaderContainer" : "loaderContainer";
    return (
      <div style={this.props.style} className={this.props.show ? showClass : hideClass }>
          <div className={this.props.waiting ? "waiting-loader loader" : "loader"}>
              <span className="dot dot_1"></span>
              <span className="dot dot_2"></span>
              <span className="dot dot_3"></span>
              <span className="dot dot_4"></span>
          </div>
      </div>
    )
  }
});

module.exports = Loader;

