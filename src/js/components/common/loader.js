import React from 'react';

var Loader = React.createClass({
  render: function () {
    var hideClass = this.props.fade ? "hidden" : "loaderContainer shrunk";
    return (
      <div className={this.props.show ? "loaderContainer" : hideClass }>
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

