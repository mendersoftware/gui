import React from 'react';
import Time from 'react-time';
import { Router, Link } from 'react-router';

// material ui
import { List, ListItem }  from 'material-ui/List';
import Divider from 'material-ui/Divider';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';

var SelectedImage = React.createClass({
  getInitialState: function() {
    return {
      descEdit: false
    };
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.descEdit) { this.refs.description.focus() };
  },
  _handleLinkClick: function(device_type) {
    var filters = "device_type="+device_type;
    filters = encodeURIComponent(filters);
    this.props.history.push("/devices/:group/:filters", {filters: filters}, null);
  },
  _clickImageSchedule: function() {
    this.props.openSchedule("schedule", this.props.image);
  },
  _descEdit: function(image, event) {
    event.stopPropagation();
    if (event.keyCode === 13 || !event.keyCode) {
    
      if (this.state.descEdit) {
        image.description = this.refs.description.getValue();
        // save change
        this.props.editImage(image);
      }
      this.setState({descEdit: !this.state.descEdit});
    }
  },
  render: function() {
    var info = {name: "-", device_type: "-", build_date: "-", modified: "-", size: "-", checksum: "-", devices: "-", description: "-"};
    if (this.props.image) {
      for (var key in this.props.image) {
        if (this.props.image[key]) {
          info[key] = this.props.image[key];
        };
        if (key.indexOf("modified")!==-1) {
          info[key] = (
            <Time style={{position:"relative", top:"4px"}} value={this.props.formatTime(this.props.image[key])} format="YYYY-MM-DD HH:mm" />
          )
        }
      }
    }

    var styles = {
      editButton: {
        color: "rgba(0, 0, 0, 0.54)",
        fontSize: "20px" 
      },
      listStyle: {
        fontSize: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        wordWrap:"break-word"
      }
    }

    var editButtonDesc = (
      <IconButton className="hidden" iconStyle={styles.editButton} style={{position:"absolute", right:"0", bottom: "8px"}} onClick={this._descEdit.bind(null, this.props.image)} iconClassName="material-icons">
        {this.state.descEdit ? "check" : "edit"}
      </IconButton>
    );

    var descInput = (
      <TextField 
        id="inline-description"
        className={this.state.descEdit ? null : "hidden"} 
        style={{width:"100%", height:"38px", marginTop:"-8px" }} inputStyle={{ marginTop:"0" }}
        multiLine={true} rowsMax={2} ref="description" 
        defaultValue={info.description} 
        onKeyDown={this._descEdit.bind(null, this.props.image)} />
    );

    var devicesFilter = "artifact_name="+info.name;
    devicesFilter = encodeURIComponent(devicesFilter);    
    var devicesLink = (
      <div>
        <span>{info.devices}</span>
        <Link className={info.devices == '-' ? 'hidden' : "listItem-link" } to={`/devices/0/${devicesFilter}`}>View devices</Link>
      </div>
    );

    return (
      <div className={this.props.image.name == null ? "muted" : null}>
        <h3 className="margin-bottom-none">Image details</h3>
        <div>
          <div className="image-list list-item">
            <List style={{backgroundColor: "rgba(255,255,255,0)"}}>
              <ListItem style={styles.listStyle} disabled={true} primaryText="Date uploaded" secondaryText={info.modified} />
              <Divider />
            </List>
          </div>
          <div className="image-list list-item">
            <List style={{backgroundColor: "rgba(255,255,255,0)"}}>
              <ListItem style={styles.listStyle} disabled={true} primaryText="Installed on devices" secondaryText={devicesLink} />
              <Divider /> 
            </List>
          </div>
        </div>

        <div className="relative">
          <div className="report-list" style={{padding:"0px", width:"63%", position:"relative"}}>
            <div style={{padding:"12px 16px 10px", fontSize:"12px", lineHeight:"12px"}}>
              <span style={{color:"rgba(0,0,0,0.8)"}}>Description</span>
              <div style={{color:"rgba(0,0,0,0.54)", marginRight:"30px", marginTop:"8px", whiteSpace: "normal"}}>
                <span className={this.state.descEdit ? "hidden" : null}>{info.description}</span>
                {descInput}
              </div>
              {editButtonDesc}
            </div>
            <hr style={{margin:"0", backgroundColor:"#e0e0e0", height:"1px", border:"none"}} />
          </div>
          <div className="report-list" style={{width:"320px"}}>
            <List style={{backgroundColor: "rgba(255,255,255,0)", paddingTop:"0"}}>
              <ListItem
                style={{fontSize:"12px"}}
                disabled={this.props.image.name ? false : true}
                primaryText="Deploy as an update"
                secondaryText="Deploy this image to devices"
                onClick={this._clickImageSchedule}
                leftIcon={<FontIcon style={{marginTop:"6px"}} className="material-icons">schedule</FontIcon>} />
              <Divider />
            </List>
          </div>
       
          <div className="report-list" style={{height:"130px", width:"0"}}></div>
        </div>
      </div>
    );
  }
});

SelectedImage.contextTypes = {
  router: React.PropTypes.object,
};

module.exports = SelectedImage;


        