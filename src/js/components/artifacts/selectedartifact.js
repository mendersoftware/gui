import React from 'react';
import PropTypes from 'prop-types';

// material ui
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import AppActions from '../../actions/app-actions';
import ArtifactPayload from './artifactPayload';
import { FileSize } from './../../helpers';

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
  componentDidUpdate(prevProps) {
    const self = this;
    if (prevProps.artifact.id !== self.props.artifact.id || !self.state.downloadUrl) {
      AppActions.getArtifactUrl(self.props.artifact.id)
        .then(response => self.setState({ downloadUrl: response.uri }))
        .catch(error => {
          console.log(error);
          self.setState({ downloadUrl: null });
        });
    }
    if (!self.state.descEdit && self.props.artifact.description && self.state.description !== self.props.artifact.description) {
      self.setState({ description: self.props.artifact.description || '-' });
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
  _toggleArtifactContentVisibility() {
    this.setState({ showArtifacts: !this.state.showArtifacts });
  }
  render() {
    const self = this;

    const artifact = self.props.artifact;

    const styles = {
      editButton: {
        color: 'rgba(0, 0, 0, 0.54)',
        marginBottom: '10px',
      },
      listStyle: {
        fontSize: '12px',
        paddingBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      },
      listItemStyle: {
        color: '#404041',
        fontSize: '13px'
      }
    };

    return (
      <div className={artifact.name == null ? 'muted' : null}>
        <div style={styles.listStyle}>
          <FormControl className="list-item list-item-large">
            <InputLabel htmlFor="artifact-description">Description</InputLabel>
            <Input
              id="artifact-description"
              type="text"
              style={styles.listItemStyle}
              disabled={!self.state.descEdit}
              value={self.state.description}
              onKeyDown={e => this._onToggleEditing(e)}
              onChange={e => this._descEdit(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton style={styles.editButton} onClick={e => self._onToggleEditing(e)}>
                    {self.state.descEdit ? <CheckIcon /> : <EditIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl className="list-item">
            <InputLabel htmlFor="artifact-size">Total Size</InputLabel>
            <Input
              id="artifact-size"
              type="text"
              style={Object.assign({ padding: '6px 0 7px' }, styles.listItemStyle)}
              disabled={true}
              inputComponent={FileSize}
              inputProps={{ fileSize: artifact.size }}
              value={artifact.size}
            />
          </FormControl>
        </div>

        <ExpansionPanel
          square
          expanded={self.state.showArtifacts}
          onChange={() => self._toggleArtifactContentVisibility()}
          style={{ background: '#e9e9e9', borderTop: 'none', padding: '0 15px', margin: '30px 0' }}
        >
          <ExpansionPanelSummary style={{ padding: 0 }}>
            <p>Artifact contents</p>
            <div style={{ marginLeft: 'auto' }}>{self.state.showArtifacts ? <RemoveIcon /> : <AddIcon />}</div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: 0 }}>
            {artifact.updates ? (
              artifact.updates.map((update, index) => <ArtifactPayload index={index} payload={update} key={`artifact-update-${index}`} />)
            ) : (
              <div />
            )}
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <Button component="a" href={self.state.downloadUrl} target="_blank" disabled={!self.state.downloadUrl}>
          <ExitToAppIcon style={{ transform: 'rotateZ(90deg)' }} className="buttonLabelIcon" />
          Download Artifact
        </Button>
        <div className="margin-left inline">
          <Button onClick={() => self.props.removeArtifact(self.props.artifact)}>
            <CancelIcon className="red auth buttonLabelIcon" />
            Remove this Artifact?
          </Button>
        </div>
      </div>
    );
  }
}
