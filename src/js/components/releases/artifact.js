import React, { useEffect } from 'react';

// material ui
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import ArtifactDetails from './artifactdetails';

const useStyles = makeStyles()(theme => ({
  accordion: {
    border: '1px solid',
    borderColor: theme.palette.grey[500],
    width: '100%'
  }
}));

export const Artifact = ({ artifact, columns, expanded, index, onEdit, onExpanded, onRowSelection, showRemoveArtifactDialog }) => {
  const { classes } = useStyles();

  useEffect(() => {
    onExpanded();
  }, []);

  return (
    <div className="release-repo-item flexbox">
      <div className="muted">{index + 1}</div>
      <Accordion
        className={classes.accordion}
        square
        expanded={expanded}
        onChange={() => onRowSelection(artifact)}
        TransitionProps={{ onEntered: onExpanded, onExited: onExpanded }}
      >
        <AccordionSummary style={{ padding: '0 12px' }} classes={{ content: 'repo-item' }}>
          {columns.map(({ name, render: Component }) => (
            <Component key={name} artifact={artifact} />
          ))}
          <IconButton className="expandButton" size="large">
            {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </IconButton>
        </AccordionSummary>
        <AccordionDetails>
          <ArtifactDetails
            artifact={artifact}
            editArtifact={onEdit}
            open={expanded}
            onExpansion={onExpanded}
            showRemoveArtifactDialog={showRemoveArtifactDialog}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default Artifact;
