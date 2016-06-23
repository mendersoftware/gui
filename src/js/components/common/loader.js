import React from 'react';

var Loader = React.createClass({
  render: function () {
    return (
      <div className={this.props.show ? "loaderContainer" : "hidden"}>
          <div className="loader">
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

