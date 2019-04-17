import React from 'react';
import Time from 'react-time';

// material ui
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import IconButton from '@material-ui/core/IconButton';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

import { formatTime } from '../../helpers';
import AppStore from '../../stores/app-store';
import SelectedArtifact from './selectedartifact';

export default class ReleaseRepositoryItem extends React.PureComponent {
  render() {
    const self = this;
    const { artifact, expanded, index, onEdit, onRowSelection, release, removeArtifact, width } = self.props;
    const compatible = artifact.device_types_compatible.join(', ');
    const storedArtifact = AppStore.getSoftwareArtifact('id', artifact.id);
    const expandedArtifact = expanded ? Object.assign({}, release, storedArtifact) : {};
    const artifactType = artifact.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '');
    const columnStyle = { width };
    return (
      <div className="flexbox release-repo-item">
        <div className="muted">{index + 1}</div>
        <ExpansionPanel
          square
          expanded={expanded}
          onChange={() => onRowSelection(artifact)}
          style={{ width: '100%', border: '1px solid', borderColor: '#e0e0e0' }}
        >
          <ExpansionPanelSummary style={{ padding: '0 12px' }}>
            <div style={columnStyle}>{compatible}</div>
            <Time value={formatTime(artifact.modified)} format="YYYY-MM-DD HH:mm" style={columnStyle} />
            <div style={Object.assign({}, columnStyle, { maxWidth: '100vw' })}>{artifactType}</div>
            <div style={columnStyle}>{artifact.signed ? <CheckCircleOutlineIcon className="green" /> : '-'}</div>
            <IconButton className="expandButton">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            {expanded ? (
              <SelectedArtifact
                removeArtifact={removeArtifact}
                formatTime={formatTime}
                editArtifact={(id, description) => onEdit(id, description)}
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
