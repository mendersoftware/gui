var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

// material ui
var mui = require('material-ui');

var Health = React.createClass({
  _clickHandle: function() {
    this.props.clickHandle();
  },
  render: function() {
    return (
      <div className="health">
        <div className="dashboard-header">
          <h2>Devices <span className="dashboard-number">8</span></h2>
        </div>
        <div className="dashboard-container">
          <div className="health-panel red">
            <span className="number">{this.props.health.down}</span>
            <span>down</span>
          </div>
          <div className="health-panel green">
            <span className="number">{this.props.health.up}</span>
            <span>up</span>
          </div>
          <div className="health-panel lightestgrey">
            <span className="number">{this.props.health.new}</span>
            <span>new</span>
          </div>
          <div className="clear">
            <Link to="/devices" className="float-right">Manage devices</Link>
          </div>
        </div>
      </div>
    );
  }
});


Health.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Health;