var React = require('react');

// material ui
var mui = require('material-ui');
var Paper = mui.Paper;

var Health = React.createClass({
  _clickHandle: function() {
    this.props.clickHandle(this.props.route);
  },
  render: function() {
    return (
      <Paper zDepth={1} className="widget small clickable" onClick={this._clickHandle}>
        <h3>Device health</h3>
        <p>Down: {this.props.health.down}</p>
        <hr/>
        <p>Up: {this.props.health.up}</p>
      </Paper>
    );
  }
});

module.exports = Health;