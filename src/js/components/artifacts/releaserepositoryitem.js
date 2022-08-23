import React, { useEffect } from 'react';

// material ui
import { Accordion, AccordionDetails, AccordionSummary, IconButton, Tooltip } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import { formatTime, FileSize } from '../../helpers';
import Time from '../common/time';
import SelectedArtifact from './selectedartifact';

const useStyles = makeStyles()(theme => ({
  accordion: {
    border: '1px solid',
    borderColor: theme.palette.grey[500],
    width: '100%'
  }
}));

export const ReleaseRepositoryItem = ({ artifact, expanded, index, itemRef, onEdit, onExpanded, onRowSelection, showRemoveArtifactDialog }) => {
  const { classes } = useStyles();

  useEffect(() => {
    onExpanded();
  }, []);

  const compatible = artifact.artifact_depends ? artifact.artifact_depends.device_type.join(', ') : artifact.device_types_compatible.join(', ');
  const artifactType = artifact.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '');
  return (
    <div className="release-repo-item flexbox" ref={itemRef}>
      <div className="muted">{index + 1}</div>
      <Accordion
        className={classes.accordion}
        square
        expanded={expanded}
        onChange={() => onRowSelection(artifact)}
        TransitionProps={{ onEntered: onExpanded, onExited: onExpanded }}
      >
        <AccordionSummary style={{ padding: '0 12px' }} classes={{ content: 'repo-item' }}>
          <Tooltip title={compatible} placement="top-start">
            <div className="text-overflow">{compatible}</div>
          </Tooltip>
          <Time value={formatTime(artifact.modified)} />
          <div style={{ maxWidth: '100vw' }}>{artifactType}</div>
          <FileSize fileSize={artifact.size} />
          <IconButton className="expandButton" size="large">
            {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </IconButton>
        </AccordionSummary>
        <AccordionDetails>
          <SelectedArtifact artifact={artifact} editArtifact={onEdit} onExpansion={onExpanded} showRemoveArtifactDialog={showRemoveArtifactDialog} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ReleaseRepositoryItem;
