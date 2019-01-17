import React from 'react';
import PropTypes from 'prop-types';
import Time from 'react-time';

// material ui
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';

export default class SelectedArtifact extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      descEdit: false
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
    this.props.history.push('/devices/:group/:filters', { filters: filters }, null);
  }
  _descEdit(event) {
    event.stopPropagation();
    if (event.keyCode === 13 || !event.keyCode) {
      if (this.state.descEdit) {
        // save change
        this.props.editArtifact(this.props.artifact.id, this.refs.description.getValue());
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

    var styles = {
      editButton: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '20px'
      },
      listStyle: {
        fontSize: '12px',
        paddingTop: '10px',
        paddingBottom: '10px',
        wordWrap: 'break-word',
        whiteSpace: 'normal'
      }
    };

    var editButtonDesc = (
      <IconButton
        iconStyle={styles.editButton}
        style={{ position: 'absolute', right: '0', bottom: '8px' }}
        onClick={e => this._descEdit(e)}
        iconClassName="material-icons"
      >
        {this.state.descEdit ? 'check' : 'edit'}
      </IconButton>
    );

    var descInput = (
      <TextField
        id="inline-description"
        className={this.state.descEdit ? null : 'hidden'}
        style={{ width: '100%', height: '38px', marginTop: '-8px' }}
        inputStyle={{ marginTop: '0' }}
        multiLine={true}
        rowsMax={2}
        ref="description"
        defaultValue={info.description}
        onKeyDown={e => this._descEdit(e)}
      />
    );

    var files = this.props.artifact.updates[0].files || [];
    var fileDetails = files.map((file, index) => {
      var build_date = <Time value={file.date} format="YYYY-MM-DD HH:mm" />;

      return (
        <div key={index} className="file-details">
          <ListItem style={styles.listStyle} disabled={true} primaryText="Name" secondaryText={file.name} secondaryTextLines={2} />
          <Divider />
          <ListItem style={styles.listStyle} disabled={true} primaryText="Checksum" secondaryText={file.checksum} secondaryTextLines={2} />
          <Divider />
          <ListItem style={styles.listStyle} disabled={true} primaryText="Build date" secondaryText={build_date} />
          <Divider />
          <ListItem style={styles.listStyle} disabled={true} primaryText="Size (uncompressed)" secondaryText={`${(file.size / 1000000).toFixed(1)} MB`} />
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
                  <span className={this.state.descEdit ? 'hidden' : null}>{info.description || '-'}</span>
                  {descInput}
                </div>
                {editButtonDesc}
              </div>
              <hr style={{ margin: '0', backgroundColor: '#e0e0e0', height: '1px', border: 'none' }} />
            </div>
          </div>

          <div className="artifact-list list-item">
            <List style={{ backgroundColor: 'rgba(255,255,255,0)' }}>
              <ListItem
                style={styles.listStyle}
                disabled={true}
                secondaryTextLines={2}
                primaryText="Device type compatibility"
                secondaryText={this.props.compatible}
              />
              <Divider />
            </List>
          </div>
          <div className="artifact-list list-item">
            <List style={{ backgroundColor: 'rgba(255,255,255,0)' }}>
              <ListItem style={styles.listStyle} disabled={true} primaryText="Signed" secondaryTextLines={2} secondaryText={info.signed ? 'Yes' : 'No'} />
              <Divider />
              <ListItem
                style={styles.listStyle}
                primaryText="Remove this artifact?"
                onClick={this.props.removeArtifact}
                leftIcon={
                  <FontIcon className="material-icons red auth" style={{ marginTop: 12, marginBottom: 6 }}>
                    cancel
                  </FontIcon>
                }
              />
            </List>
          </div>
        </div>

        <h4 className="margin-bottom-none">Files in Artifact</h4>
        <div>{fileDetails}</div>
      </div>
    );
  }
}
