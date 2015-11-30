var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var Time = require('react-time');
var AppStore = require('../../stores/app-store');

// material ui
var mui = require('material-ui');
var List = mui.List;
var ListItem = mui.ListItem;
var ListDivider = mui.ListDivider;
var FontIcon = mui.FontIcon;


var Progress = React.createClass({
  _getProgress: function (id) {
    return AppStore.getProgressStatus(id);
  },
  _clickHandle: function () {
    this.props.clickHandle(this.props.route);
  },
  render: function() {
    var progress = this.props.updates.map(function(update, index) {
      var group = update.group + " (" + update.devices.length + ")";
      var last = (this.props.updates.length === index+1) || index===4;
      var progress = this._getProgress(update.id);
      var complete = ((progress.complete / update.devices.length)*100).toFixed(0);
      var failed = ((progress.failed / update.devices.length)*100).toFixed(0);
      var total = Number(complete) + Number(failed);

      var progressBar = (
          <div className="progressBar">
            <div className="lightgrey">
              <div className="green float-left" style={{width:complete+"%"}}></div>
              <div className="red float-left" style={{width:failed+"%"}}></div>
            </div>
          </div>
      );
      return (
        <div key={index}>
          <ListItem
            disabled={true}
            style={{paddingBottom:"12", height:"50"}}
            primaryText={progressBar}
            secondaryText={<Time style={{fontSize:"12"}} className="progressTime" value={update.start_time} format="YY/MM/DD HH:mm" />}
            onClick={this._clickUpdate}
            leftIcon={<div style={{width:"110", height:"auto"}}><span className="progress-version">{update.software_version}</span><span className="progress-group">{group}</span></div>}
            rightIcon={<span style={{top:"18", right:"22"}}>{total}%</span>} />
          <ListDivider className={last ? "hidden" : null} />
        </div>
      )
    }, this);
    return (
      <div className="updates-container">
        <div className="dashboard-header subsection">
          <h3>In progress<span className="dashboard-number">{progress.length}</span></h3>
        </div>
        <div>
          <List>
            {progress}
          </List>
          <div className={progress.length ? 'hidden' : null}>
            <p className="italic">No updates in progress</p>
          </div>
          <Link to="/updates" className="float-right">All updates</Link>
        </div>
      </div>
    );
  }
});

Progress.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Progress;