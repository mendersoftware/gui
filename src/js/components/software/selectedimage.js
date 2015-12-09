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
var IconButton = mui.IconButton;

var ReactTags = require('react-tag-input').WithContext;
var tagslist = [];


var SelectedImage = React.createClass({
  getInitialState: function() {
    return {
      tagEdit: false,
      descEdit: false
    };
  },
  _handleLinkClick: function(model) {
    var filters = "model="+model;
    filters = encodeURIComponent(filters);
    this.props.history.push("/devices/:groupId/:filters", {groupId:1, filters: filters}, null);
  },
  _clickImageSchedule: function() {
    this.props.openSchedule("schedule", this.props.image);
  },
  handleDelete: function(i) {
    tagslist.splice(i, 1);
  },
  handleAddition: function(tag) {
    tagslist.push({
        id: tagslist.length + 1,
        text: tag
    });
  },
  handleDrag: function(tag, currPos, newPos) {

  },
  _tagsEdit: function(image) {
    if (this.state.tagEdit) {
      var noIds = [];
      for (var i in tagslist) {
        noIds.push(tagslist[i].text);
      }

      // save new tag data to image
      image.tags = noIds;
      this.props.uploadImage(image);
      
      // hacky
      var newimage = this.props.image;
      newimage.tags = image.tags;
    }
    this.setState({tagEdit: !this.state.tagEdit});
  },
  _initTagslist: function(list) {
     for (var i in list) {
      if (list[i] !== '-') {
        tagslist.push({id: i, text:list[i]});
      }
    }
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
    tagslist = [];
    this._initTagslist(info.tags);

    var styles = {
      editButton: {
        color: "rgba(0, 0, 0, 0.54)",
        fontSize: "20" 
      }
    }
    var editButton = (
      <IconButton iconStyle={styles.editButton} style={{top:"auto", bottom: "0"}} onClick={this._tagsEdit.bind(null, info)} iconClassName="material-icons">
        {this.state.tagEdit ? "check" : "edit"}
      </IconButton>
    );
    var editButtonDesc = (
      <IconButton iconStyle={styles.editButton} style={{position:"absolute", right:"0", bottom: "0"}} iconClassName="material-icons">
        {this.state.descEdit ? "check" : "edit"}
      </IconButton>
    );

    var tagInput = (
      <ReactTags tags={tagslist} 
        handleDelete={this.handleDelete}  
        handleAddition={this.handleAddition}
        handleDrag={this.handleDrag}
        delimeters={[9, 13, 188]} />
    );

    var tags = this.state.tagEdit ? tagInput : info.tags.join(', ');

    return (
      <div id="imageInfo" className={this.props.image.name == null ? "muted" : null}>
        <h3>Image details</h3>
        <div className="report-list">
          <List>
            <ListItem disabled={true} primaryText="Software" secondaryText={info.name} />
            <ListDivider />
            <ListItem disabled={this.props.image.model ? false : true} primaryText="Device type" secondaryText={info.model} onClick={this._handleLinkClick.bind(null, info.model)} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Size" secondaryText={info.size} />
            <ListDivider />
          </List>
        </div>
        <div className="report-list">
          <List>
            <ListItem disabled={true} primaryText="Date built" secondaryText={info.build_date} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Date uploaded" secondaryText={info.upload_date} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Installed on devices" secondaryText={info.devices ? info.devices : "-"} />
            <ListDivider />
          </List>
        </div>
        <div className="report-list" style={{width: "320"}}>
          <List>
            <ListItem rightIconButton={editButton} disabled={true} primaryText="Tags" secondaryText={tags} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Checksum" secondaryTextLines={2} style={{wordWrap:"break-word"}} secondaryText={info.checksum} />
            <ListDivider />
          </List>
        </div>
        <div className="float-right">
          
        </div>
        <div className="margin-top">
          <div className="report-list" style={{padding:"16", width:"560", verticalAlign:"top", position:"relative"}}>
            <span style={{fontSize:"16", color:"rgba(0,0,0,0.8)"}}>Description</span>
            <p style={{color:"rgba(0,0,0,0.54)", marginRight:"30"}}>{info.description}</p>
            {editButtonDesc}
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


        