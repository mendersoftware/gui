import React from 'react';
import { connect } from 'react-redux';

// material ui
import {
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel
} from '@material-ui/core';

import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Cancel as CancelIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  ExitToApp as ExitToAppIcon
} from '@material-ui/icons';

import { getArtifactUrl, showRemoveArtifactDialog } from '../../actions/releaseActions';
import ArtifactPayload from './artifactPayload';

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

export class SelectedArtifact extends React.Component {
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
      self.setState({ gettingUrl: true }, () => self.props.getArtifactUrl(self.props.artifact.id).then(() => self.setState({ gettingUrl: false })));
    }
    if (!self.state.descEdit && self.props.artifact.description && self.state.description !== self.props.artifact.description) {
      self.setState({ description: self.props.artifact.description || '-' });
    }
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

    const { artifact, onExpansion } = self.props;

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
              onChange={e => self.setState({ description: e.target.value })}
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

        <Button href={artifact.url} target="_blank" disabled={!artifact.url} startIcon={<ExitToAppIcon style={{ transform: 'rotateZ(90deg)' }} />}>
          Download Artifact
        </Button>
        <div className="margin-left inline">
          <Button onClick={() => self.props.showRemoveArtifactDialog(true)} startIcon={<CancelIcon className="red auth" />}>
            Remove this Artifact?
          </Button>
        </div>
      </div>
    );
  }
}

const actionCreators = { getArtifactUrl, showRemoveArtifactDialog };

export default connect(null, actionCreators)(SelectedArtifact);
