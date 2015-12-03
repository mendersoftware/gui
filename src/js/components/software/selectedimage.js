import React from 'react';
import Time from 'react-time';
import Router from 'react-router';

// material ui
import mui from 'material-ui';

var List = mui.List;
var ListItem = mui.ListItem;
var ListDivider = mui.ListDivider;
var FontIcon = mui.FontIcon;
var FlatButton = mui.FlatButton;


var SelectedImage = React.createClass({
  _handleLinkClick: function(model) {
    var filters = "model="+model;
    filters = encodeURIComponent(filters);
    this.props.history.pushState(null, "/devices/:groupId/:filters", {groupId:1, filters: filters}, null);
  },
  _clickImageSchedule: function() {
    this.props.openSchedule("schedule", this.props.image);
  },
  render: function() {
    var info = {name: "-", tags: ['-'], model: "-", build_date: "-", upload_date: "-", size: "-", checksum: "-", devices: "-"};
    if (this.props.image) {
      for (var key in this.props.image) {
        if (this.props.image[key] != null) { info[key] = this.props.image[key] };
        if (key.indexOf("date")!==-1) {
          info[key] = (
            <Time style={{position:"relative", top:"4"}} value={this.props.image[key]} format="YYYY/MM/DD HH:mm" />
          )
        }
      }
    }
    return (
      <div id="imageInfo" className={this.props.image.name == null ? "muted" : null}>
        <h3>Image details</h3>
        <div className="report-list">
          <List>
            <ListItem disabled={true} primaryText="Software" secondaryText={info.name} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Tags" secondaryText={info.tags} />
            <ListDivider />
            <ListItem disabled={this.props.image.model ? false : true} primaryText="Device type" secondaryText={info.model} onClick={this._handleLinkClick.bind(null, info.model)} />
            <ListDivider />
          </List>
        </div>
        <div className="report-list">
          <List>
            <ListItem disabled={true} primaryText="Date built" secondaryText={info.build_date} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Date uploaded" secondaryText={info.upload_date} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Size" secondaryText={info.size} />
            <ListDivider />
          </List>
        </div>
        <div className="report-list" style={{width: "320"}}>
          <List>
            <ListItem disabled={true} primaryText="Checksum" secondaryTextLines={2} style={{wordWrap:"break-word"}} secondaryText={info.checksum} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Installed on devices" secondaryText={info.devices ? info.devices : "-"} />
            <ListDivider />
          </List>
        </div>
        <div className="float-right">
          <FlatButton disabled={!this.props.image.name} label="Edit image details" onClick={this.props.editImage.bind(null, "schedule", this.props.image)}>
            <FontIcon style={this.props.buttonStyle} className="material-icons">edit</FontIcon>
          </FlatButton>
        </div>
        <div className="margin-top">
          <div className="report-list" style={{padding:"16", width:"560", verticalAlign:"top"}}>
            <span style={{fontSize:"16", color:"rgba(0,0,0,0.8)"}}>Description</span>
            <p style={{color:"rgba(0,0,0,0.54)"}}>{info.description}</p>
          </div>
          <div className="report-list" style={{width:"320"}}>
            <List>
              <ListItem
                disabled={this.props.image.name ? false : true}
                primaryText="Schedule update"
                secondaryText="Create an update with this image"
                onClick={this._clickImageSchedule}
                leftIcon={<FontIcon className="material-icons">schedule</FontIcon>} />
              <ListDivider />
            </List>
          </div>
        </div>
      </div>
    );
  }
});

SelectedImage.contextTypes = {
  location: React.PropTypes.object,
  history: React.PropTypes.object
};

module.exports = SelectedImage;


        