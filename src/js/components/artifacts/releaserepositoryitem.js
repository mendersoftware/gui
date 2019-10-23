import React from 'react';
import Time from 'react-time';

// material ui
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import { formatTime, FileSize } from '../../helpers';
import AppStore from '../../stores/app-store';
import SelectedArtifact from './selectedartifact';

export default class ReleaseRepositoryItem extends React.PureComponent {
  componentDidMount() {
    this.props.onExpanded();
  }

  render() {
    const self = this;
    const { artifact, expanded, index, onEdit, onExpanded, onRowSelection, release, removeArtifact } = self.props;
    const compatible = artifact.device_types_compatible.join(', ');
    const storedArtifact = AppStore.getSoftwareArtifact('id', artifact.id);
    const expandedArtifact = expanded ? Object.assign({}, release, storedArtifact) : {};
    const artifactType = artifact.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '');
    return (
      <div className="release-repo-item flexbox" ref={ref => (this.itemRef = ref)}>
        <div className="muted">{index + 1}</div>
        <ExpansionPanel
          square
          expanded={expanded}
          onChange={() => onRowSelection(artifact)}
          TransitionProps={{ onEntered: () => onExpanded(), onExited: () => onExpanded() }}
          style={{ width: '100%', border: '1px solid', borderColor: '#e0e0e0' }}
        >
          <ExpansionPanelSummary style={{ padding: '0 12px' }} classes={{ content: 'repo-item' }}>
            <Tooltip title={compatible} placement="top-start">
              <div className="nowrap text-overflow">{compatible}</div>
            </Tooltip>
            <Time value={formatTime(artifact.modified)} format="YYYY-MM-DD HH:mm" />
            <div style={{ maxWidth: '100vw' }}>{artifactType}</div>
            <FileSize fileSize={artifact.size} />
            <IconButton className="expandButton">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            {expanded ? (
              <SelectedArtifact
                removeArtifact={removeArtifact}
                formatTime={formatTime}
                editArtifact={(id, description) => onEdit(id, description)}
                onExpansion={() => onExpanded()}
                artifact={expandedArtifact}
              />
            ) : (
              <div />
            )}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}
