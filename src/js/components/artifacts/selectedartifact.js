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

import CancelIcon from '@material-ui/icons/Cancel';

import ArtifactPayload from './artifactPayload';

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
        fontSize: '20px'
      },
      listStyle: {
        fontSize: '12px',
        paddingTop: '10px',
        paddingBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      }
    };

    return (
      <div className={artifact.name == null ? 'muted' : null}>
        <h3 className="margin-bottom-none">Artifact details</h3>
        <div style={styles.listStyle}>
          <FormControl className="list-item">
            <InputLabel htmlFor="artifact-description">Description</InputLabel>
            <Input
              id="artifact-description"
              type="text"
              disabled={!self.state.descEdit}
              value={self.state.description}
              onKeyDown={e => this._onToggleEditing(e)}
              onChange={e => this._descEdit(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton style={styles.editButton} onClick={e => self._onToggleEditing(e)} className="material-icons">
                    {self.state.descEdit ? 'check' : 'edit'}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </div>

        <ExpansionPanel
          square
          expanded={self.state.showArtifacts}
          onChange={() => self._toggleArtifactContentVisibility()}
          style={{ background: 'transparent', borderTop: 'none', padding: 0 }}
        >
          <ExpansionPanelSummary style={{ padding: 0 }}>
            <h4>Artifact contents</h4>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: 0 }}>
            {artifact.updates ? artifact.updates.map((update, index) => <ArtifactPayload payload={update} key={`artifact-update-${index}`} />) : <div />}
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <Button onClick={() => self.props.removeArtifact(self.props.artifact)}>
          <CancelIcon className="red auth" />
          Remove this artifact?
        </Button>
      </div>
    );
  }
}
