import React, { useEffect } from 'react';
import Time from 'react-time';

// material ui
import { Accordion, AccordionDetails, AccordionSummary, IconButton, Tooltip } from '@material-ui/core';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import { formatTime, FileSize } from '../../helpers';
import { colors } from '../../themes/mender-theme';
import SelectedArtifact from './selectedartifact';
import LocaleFormatString from '../common/timeformat';

export const ReleaseRepositoryItem = ({ artifact, expanded, index, itemRef, onEdit, onExpanded, onRowSelection }) => {
  useEffect(() => {
    onExpanded();
  }, []);

  const compatible = artifact.artifact_depends ? artifact.artifact_depends.device_type.join(', ') : artifact.device_types_compatible.join(', ');
  const artifactType = artifact.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '');
  return (
    <div className="release-repo-item flexbox" ref={itemRef}>
      <div className="muted">{index + 1}</div>
      <Accordion
        square
        expanded={expanded}
        onChange={() => onRowSelection(artifact)}
        TransitionProps={{ onEntered: onExpanded, onExited: onExpanded }}
        style={{ width: '100%', border: '1px solid', borderColor: colors.borderColor }}
      >
        <AccordionSummary style={{ padding: '0 12px' }} classes={{ content: 'repo-item' }}>
          <Tooltip title={compatible} placement="top-start">
            <div className="text-overflow">{compatible}</div>
          </Tooltip>
          <Time value={formatTime(artifact.modified)} format={LocaleFormatString()} />
          <div style={{ maxWidth: '100vw' }}>{artifactType}</div>
          <FileSize fileSize={artifact.size} />
          <IconButton className="expandButton">{expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
        </AccordionSummary>
        <AccordionDetails>
          {expanded && <SelectedArtifact artifact={artifact} editArtifact={(id, description) => onEdit(id, description)} onExpansion={onExpanded} />}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ReleaseRepositoryItem;
