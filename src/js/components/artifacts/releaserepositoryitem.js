import React from 'react';
import Time from 'react-time';

// material ui
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import { formatTime, FileSize } from '../../helpers';
import SelectedArtifact from './selectedartifact';

export default class ReleaseRepositoryItem extends React.PureComponent {
  componentDidMount() {
    this.props.onExpanded();
  }

  render() {
    const self = this;
    const { artifact, expanded, index, onEdit, onExpanded, onRowSelection } = self.props;
    const compatible = artifact.artifact_depends ? artifact.artifact_depends.device_type.join(', ') : artifact.device_types_compatible.join(', ');
    const artifactType = artifact.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '');
    return (
      <div className="release-repo-item flexbox" ref={ref => (this.itemRef = ref)}>
        <div className="muted">{index + 1}</div>
        <Accordion
          square
          expanded={expanded}
          onChange={() => onRowSelection(artifact)}
          TransitionProps={{ onEntered: () => onExpanded(), onExited: () => onExpanded() }}
          style={{ width: '100%', border: '1px solid', borderColor: '#e0e0e0' }}
        >
          <AccordionSummary style={{ padding: '0 12px' }} classes={{ content: 'repo-item' }}>
            <Tooltip title={compatible} placement="top-start">
              <div className="text-overflow">{compatible}</div>
            </Tooltip>
            <Time value={formatTime(artifact.modified)} format="YYYY-MM-DD HH:mm" />
            <div style={{ maxWidth: '100vw' }}>{artifactType}</div>
            <FileSize fileSize={artifact.size} />
            <IconButton className="expandButton">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
          </AccordionSummary>
          <AccordionDetails>
            {expanded ? (
              <SelectedArtifact artifact={artifact} editArtifact={(id, description) => onEdit(id, description)} onExpansion={() => onExpanded()} />
            ) : (
              <div />
            )}
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }
}
