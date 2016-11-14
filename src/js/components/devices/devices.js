import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var update = require('react-addons-update');

var Groups = require('./groups');
var DeviceList = require('./devicelist');
var Unauthorized = require('./unauthorized');

var Pagination = require('rc-pagination');

import Snackbar from 'material-ui/Snackbar';

import { Router, Route, Link } from 'react-router';

function getState() {
  return {
    groups: AppStore.getGroups(),
    groupsForList: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    pendingDevices: AppStore.getPendingDevices(),
    devices: AppStore.getGroupDevices(),
    allDevices: AppStore.getAllDevices(),
    selectedDevices: AppStore.getSelectedDevices(),
    filters: AppStore.getFilters(),
    attributes: AppStore.getAttributes(),
    images: AppStore.getSoftwareRepo(),
    snackbar: AppStore.getSnackbar(),
  }
}

var Devices = React.createClass({
  getInitialState: function() {
    return getState();
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    this.setState({doneLoading:false});
    this.timer = setInterval(this._refreshAll, 10000);
    this._refreshAll();
  },
  _refreshAll: function() {
    this._refreshAdmissions();
    this._refreshDevices();
    this._refreshGroups();

    AppActions.getImages({
      success: function(images) {
        this.setState({images:images})
      }.bind(this)
    });

    var filters = [];
    if (this.props.params) {
      if (this.props.params.group) {
        AppActions.selectGroup(this.props.params.group);
        this.setState({selectedGroup:this.props.params.group});
      }
      if (this.props.params.filters) {
        var str = decodeURIComponent(this.props.params.filters);
        var obj = str.split("&");
        for (var i=0;i<obj.length;i++) {
          var f = obj[i].split("=");
          filters.push({key:f[0], value:f[1]});
        }
        this._updateFilters(filters);
      }
    }
  },
  componentWillUnmount: function () {
    clearInterval(this.timer);
    AppStore.removeChangeListener(this._onChange);
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.selectedGroup != this.state.selectedGroup) this._refreshDevices();
  },
  _onChange: function() {
    this.setState(this.getInitialState());
  },
  _refreshDevices: function(page, per_page) {
    var self = this;
    if (typeof page !=="undefined") {
       this.setState({pageNo:page});
    }
    if (typeof per_page !=="undefined") {
       this.setState({perPage:per_page});
    }
    var pageNo = typeof page !=="undefined" ? page : this.state.pageNo;
    var perPage = typeof per_page !=="undefined" ? per_page : this.state.perPage;

    var callback = {
      success: function(devices, links) {
        this.setState({devices: AppStore.getGroupDevices(), devicesPaginate: links});
        AppActions.setSnackbar("");
        setTimeout(function() {
          this.setState({doneLoading:true});
        }.bind(this), 200);
      }.bind(this),
      error: function(err) {
        this.setState({doneLoading:true, devices:[]});
        console.log(err);
        var errormsg = err.error || "Please check your connection";
        AppActions.setSnackbar("Devices couldn't be loaded. " +errormsg);
      }.bind(this)
    };
    if (!this.state.selectedGroup) {
      AppActions.getDevices(callback, pageNo, perPage);
      AppActions.getNumberOfDevices(function(noDevs) {
        self.setState({totalDevices: noDevs});
      });
    } else {
      AppActions.getGroupDevices(this.state.selectedGroup, callback, pageNo, perPage);
      AppActions.getNumberOfDevices(function(noDevs) {
        self.setState({totalDevices: noDevs});
      }, this.state.selectedGroup);
    }
    
  },
  _refreshAdmissions: function(page, per_page) {
    if (typeof page !=="undefined") {
       this.setState({admPageNo:page});
    }
    if (typeof per_page !=="undefined") {
       this.setState({admPerPage:per_page});
    }
    var pageNo = typeof page !=="undefined" ? page : this.state.admPageNo;
    var perPage = typeof per_page !=="undefined" ? per_page : this.state.admPerPage;

    AppActions.getDevicesForAdmission(function(devices, links) {
      this.setState({pendingDevices: devices, admissionPaginate: links});
    }.bind(this), pageNo, perPage);
  },
  _refreshGroups: function() {
    var callback = {
      success: function (groups) {
        this.setState({groups: groups});
      }.bind(this),
      error: function(err) {
        console.log(err);
      }
    };
    AppActions.getGroups(callback);
  },
  _addTmpGroup: function(name) {
    // use a tmp group so as not to affect the groups in state
    var groups = update(this.state.groups, {$push: [name]});
    this.setState({groupsForList: groups, selectedField: name});
  },
  _changeTmpGroup: function(group) {
    this.setState({selectedField: group});
  },
  _updateFilters: function(filters) {
    AppActions.updateFilters(filters);
  },
  _handleRequestClose: function() {
    AppActions.setSnackbar("");
  },
  _showLoader: function(bool) {
    this.setState({doneLoading: !bool});
  },
  _redirect: function(params) {
    this.context.router.push(params.route);
  },
  _handlePageChange: function(pageNo) {
    this.setState({currentPage: pageNo});
    this._refreshDevices(pageNo);
  },
  render: function() {
    return (
      <div className="margin-top">
       <div className="leftFixed">
          <Groups refreshGroups={this._refreshGroups} groups={this.state.groups} selectedGroup={this.state.selectedGroup} allDevices={this.state.allDevices} />
        </div>
        <div className="rightFluid padding-right">
          <div className={this.state.pendingDevices.length ? "fadeIn" : "hidden"}>
            <Unauthorized showLoader={this._showLoader} refresh={this._refreshDevices} refreshAdmissions={this._refreshAdmissions} pending={this.state.pendingDevices} />
          </div>
          <DeviceList redirect={this._redirect} refreshDevices={this._refreshDevices} refreshGroups={this._refreshGroups} selectedField={this.state.selectedField} changeSelect={this._changeTmpGroup} addGroup={this._addTmpGroup} loading={!this.state.doneLoading} filters={this.state.filters} attributes={this.state.attributes} onFilterChange={this._updateFilters} images={this.state.images} selectedDevices={this.state.selectedDevices} groups={this.state.groupsForList} devices={this.state.devices} selectedGroup={this.state.selectedGroup} />
          {this.state.totalDevices ? <Pagination simple pageSize={20} current={this.state.currentPage || 1} total={this.state.totalDevices} onChange={this._handlePageChange} /> : null }
        </div>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={5000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

Devices.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Devices;
