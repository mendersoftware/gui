var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

// material ui
var mui = require('material-ui');

var Activity = React.createClass({
  _clickHandle: function() {
    this.props.clickHandle();
  },
  render: function() {
    return (
      <div className="activity-log">
        <div className="dashboard-header">
          <h2>User activity</h2>
        </div>
        <div>
          <div className="margin-bottom">
          </div>
          <div>
            <Link to="/updates/events" className="float-right">View all</Link>
          </div>
        </div>
      </div>
    );
  }
});

Activity.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Activity;