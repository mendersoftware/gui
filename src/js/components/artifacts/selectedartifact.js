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
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import AppActions from '../../actions/app-actions';
import ArtifactPayload from './artifactPayload';

export default class SelectedArtifact extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      descEdit: false,
      description: this.props.artifact.description || '-',
      gettingUrl: false
    };
  }
  componentDidUpdate(prevProps) {
    const self = this;
    if (prevProps.artifact.id !== self.props.artifact.id || (!self.props.artifact.url && !self.state.gettingUrl)) {
      self.setState({ gettingUrl: true }, () => AppActions.getArtifactUrl(self.props.artifact.id).then(() => self.setState({ gettingUrl: false })));
    }
    if (!self.state.descEdit && self.props.artifact.description && self.state.description !== self.props.artifact.description) {
      self.setState({ description: self.props.artifact.description || '-' });
    }
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
    this.setState({ showPayloads: !this.state.showPayloads });
  }
  render() {
    const self = this;

    const { artifact, onExpansion, removeArtifact } = self.props;

    const styles = {
      editButton: {
        color: 'rgba(0, 0, 0, 0.54)',
        marginBottom: '10px'
      },
      listStyle: {
        fontSize: '12px',
        paddingBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between'
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
            <InputLabel htmlFor="artifact-signed">Signed</InputLabel>
            <Input
              id="artifact-signed"
              disabled={true}
              startAdornment={
                <InputAdornment position="start">
                  {artifact.signed ? <CheckCircleOutlineIcon className="green" /> : <CancelOutlinedIcon className="red" />}
                </InputAdornment>
              }
              style={styles.listItemStyle}
              type="text"
            />
          </FormControl>
        </div>

        <ExpansionPanel
          square
          expanded={self.state.showPayloads}
          onChange={() => self._toggleArtifactContentVisibility()}
          TransitionProps={{ onEntered: () => onExpansion(), onExited: () => onExpansion() }}
          style={{ background: '#e9e9e9', borderTop: 'none', padding: '0 15px', margin: '30px 0' }}
        >
          <ExpansionPanelSummary style={{ padding: 0 }}>
            <p>Artifact contents</p>
            <div style={{ marginLeft: 'auto' }}>{self.state.showPayloads ? <RemoveIcon /> : <AddIcon />}</div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: 0 }}>
            {artifact.updates ? (
              artifact.updates.map((update, index) => <ArtifactPayload index={index} payload={update} key={`artifact-update-${index}`} />)
            ) : (
              <div />
            )}
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <Button href={artifact.url} target="_blank" disabled={!artifact.url}>
          <ExitToAppIcon style={{ transform: 'rotateZ(90deg)' }} className="buttonLabelIcon" />
          Download Artifact
        </Button>
        <div className="margin-left inline">
          <Button onClick={() => removeArtifact(artifact)}>
            <CancelIcon className="red auth buttonLabelIcon" />
            Remove this Artifact?
          </Button>
        </div>
      </div>
    );
  }
}
