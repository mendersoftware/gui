var React = require('react');

// material ui
var mui = require('material-ui');

var Health = React.createClass({
  render: function() {
    return (
      <div className="widget small">
        <h3>Device health</h3>
        <p>Down: {this.props.health.down}</p>
        <hr/>
        <p>Up: {this.props.health.up}</p>
      </div>
    );
  }
});

module.exports = Health;