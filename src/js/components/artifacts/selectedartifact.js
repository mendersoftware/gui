import React from 'react';
import PropTypes from 'prop-types';
import Time from 'react-time';

// material ui
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

export default class SelectedArtifact extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      descEdit: false,
      description: this.props.artifact.description || '-'
    };
  }
  componentDidUpdate() {
    if (this.state.descEdit) {
      this.refs.description.focus();
    }
  }
  _handleLinkClick(device_type) {
    var filters = `device_type=${device_type}`;
    filters = encodeURIComponent(filters);
    this.props.history.push('/devices/:group/:filters', { filters }, null);
  }

  _descEdit(description) {
    this.setState({ description });
  }

  _onToggleEditing(event) {
    event.stopPropagation();
    if (event.keyCode === 13 || !event.keyCode) {
      if (this.state.descEdit) {
        // save change
        this.props.editArtifact(this.props.artifact.id, this.state.description);
      }
      this.setState({ descEdit: !this.state.descEdit });
    }
  }

  render() {
    var info = { name: '-', device_type: '-', build_date: '-', modified: '-', size: '-', checksum: '-', devices: '-', description: '', signed: false };
    if (this.props.artifact) {
      for (var key in this.props.artifact) {
        if (this.props.artifact[key]) {
          info[key] = this.props.artifact[key];
        }
        if (key.indexOf('modified') !== -1) {
          info[key] = <Time style={{ position: 'relative', top: '4px' }} value={this.props.formatTime(this.props.artifact[key])} format="YYYY-MM-DD HH:mm" />;
        }
      }
    }

    var editButtonDesc = (
      <IconButton style={Object.assign({ position: 'absolute', right: '0', bottom: '8px' })} onClick={e => this._onToggleEditing(e)} className="material-icons">
        {this.state.descEdit ? 'check' : 'edit'}
      </IconButton>
    );

    var descInput = (
      <TextField
        id="inline-description"
        autoFocus={true}
        className={this.state.descEdit ? null : 'hidden'}
        style={{ width: '100%', height: '38px', marginTop: '0' }}
        multiLine={true}
        rowsMax={2}
        value={this.state.description}
        onChange={e => this._descEdit(e.target.value)}
        onKeyDown={e => this._onToggleEditing(e)}
      />
    );

    var files = this.props.artifact.updates[0].files || [];
    var fileDetails = files.map((file, index) => {
      var build_date = <Time value={file.date} format="YYYY-MM-DD HH:mm" />;

      return (
        <div key={index} className="file-details">
          <ListItem disabled={true}>
            <ListItemText primary="Name" secondary={file.name} />
          </ListItem>
          <Divider />
          <ListItem disabled={true}>
            <ListItemText primary="Checksum" secondary={file.checksum} />
          </ListItem>
          <Divider />
          <ListItem disabled={true}>
            <ListItemText primary="Build date" secondary={build_date} />
          </ListItem>
          <Divider />
          <ListItem disabled={true}>
            <ListItemText primary="Size (uncompressed)" secondary={`${(file.size / 1000000).toFixed(1)} MB`} />
          </ListItem>
          <Divider />
        </div>
      );
    }, this);

    return (
      <div className={this.props.artifact.name == null ? 'muted' : null}>
        <h3 className="margin-bottom-none">Artifact details</h3>
        <div>
          <div className="artifact-list list-item">
            <div style={{ padding: '9px 0' }}>
              <div style={{ padding: '12px 16px 10px', lineHeight: '12px', height: '74px', position: 'relative' }}>
                <span style={{ color: 'rgba(0,0,0,0.8)', fontSize: '12px' }}>Description</span>
                <div style={{ color: 'rgba(0,0,0,0.54)', marginRight: '30px', marginTop: '8px', whiteSpace: 'normal' }}>
                  <span className={this.state.descEdit ? 'hidden' : null}>{this.state.description}</span>
                  {descInput}
                </div>
                {editButtonDesc}
              </div>
              <hr style={{ margin: '0', backgroundColor: '#e0e0e0', height: '1px', border: 'none' }} />
            </div>
          </div>

          <div className="artifact-list list-item">
            <List style={{ backgroundColor: 'rgba(255,255,255,0)' }}>
              <ListItem disabled={true}>
                <ListItemText primary="Device type compatibility" secondary={this.props.compatible} />
              </ListItem>
              <Divider />
            </List>
          </div>
          <div className="artifact-list list-item">
            <List style={{ backgroundColor: 'rgba(255,255,255,0)' }}>
              <ListItem disabled={true}>
                <ListItemText primary="Signed" secondary={info.signed ? 'Yes' : 'No'} />
              </ListItem>
              <Divider />
              <ListItem onClick={this.props.removeArtifact}>
                <ListItemAvatar>
                  <Icon className="material-icons red auth" style={{ marginTop: 12, marginBottom: 6 }}>
                    cancel
                  </Icon>
                </ListItemAvatar>
                <ListItemText primary="Remove this artifact?" />
              </ListItem>
            </List>
          </div>
        </div>

        <h4 className="margin-bottom-none">Files in Artifact</h4>
        <div>{fileDetails}</div>
      </div>
    );
  }
}
