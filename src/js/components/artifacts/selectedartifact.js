import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  CancelOutlined as CancelOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  ExitToApp as ExitToAppIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Button, IconButton, Input, InputAdornment, List, ListItem, ListItemText } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { getArtifactUrl } from '../../actions/releaseActions';
import { extractSoftware, toggle } from '../../helpers';
import { getUserCapabilities } from '../../selectors';
import ArtifactPayload from './artifactPayload';
import ArtifactMetadataList from './artifactmetadatalist';

const useStyles = makeStyles()(theme => ({
  editButton: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginBottom: 10
  },
  listItemStyle: {
    color: '#404041',
    fontSize: 13,
    marginRight: '2vw',
    minMidth: 200,
    padding: 0,
    bordered: {
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.grey[500]
    }
  },
  accordPanel1: {
    background: theme.palette.grey[500],
    borderTop: 'none',
    padding: '0 15px',
    marginBottom: 30,
    '&.Mui-expanded': {
      background: theme.palette.grey[500],
      marginBottom: 30
    }
  },
  accordSummary: {
    background: theme.palette.grey[500],
    padding: 0
  }
}));

export const transformArtifactCapabilities = (capabilities = {}) => {
  return Object.entries(capabilities).reduce((accu, [key, value]) => {
    if (!Array.isArray(value)) {
      accu.push({ key, primary: key, secondary: value });
    } else if (!key.startsWith('device_type')) {
      // we can expect this to be an array of artifacts or artifact groups this artifact depends on
      const dependencies = value.reduce((dependencies, dependency, index) => {
        const dependencyKey = value.length > 1 ? `${key}-${index + 1}` : key;
        dependencies.push({ key: dependencyKey, primary: dependencyKey, secondary: dependency });
        return dependencies;
      }, []);
      accu.push(...dependencies);
    }
    return accu;
  }, []);
};

export const transformArtifactMetadata = (metadata = {}) => {
  return Object.entries(metadata).reduce((accu, [key, value]) => {
    const commonProps = { key, primary: key, secondaryTypographyProps: { component: 'div' } };
    if (Array.isArray(value)) {
      accu.push({ ...commonProps, secondary: value.length ? value.join(',') : '-' });
    } else if (value instanceof Object) {
      accu.push({ ...commonProps, secondary: JSON.stringify(value) || '-' });
    } else {
      accu.push({ ...commonProps, secondary: value || '-' });
    }
    return accu;
  }, []);
};

const extractSoftwareItem = (artifactProvides = {}) => {
  const { software } = extractSoftware(artifactProvides);
  return (
    software
      .reduce((accu, item) => {
        const infoItems = item[0].split('.');
        if (infoItems[infoItems.length - 1] !== 'version') {
          return accu;
        }
        accu.push({ key: infoItems[0], name: infoItems.slice(1, infoItems.length - 1).join('.'), version: item[1], nestingLevel: infoItems.length });
        return accu;
      }, [])
      // we assume the smaller the nesting level in the software name, the closer the software is to the rootfs/ the higher the chances we show the rootfs
      // sort based on this assumption & then only return the first item (can't use index access, since there might not be any software item at all)
      .sort((a, b) => a.nestingLevel - b.nestingLevel)
      .reduce((accu, item) => accu ?? item, undefined)
  );
};

export const SelectedArtifact = ({ artifact, canManageReleases, editArtifact, getArtifactUrl, onExpansion, open, showRemoveArtifactDialog }) => {
  const { classes } = useStyles();
  const [descEdit, setDescEdit] = useState(false);
  const [description, setDescription] = useState(artifact.description);
  const [gettingUrl, setGettingUrl] = useState(false);
  const [showPayloads, setShowPayloads] = useState(false);
  const [showProvidesDepends, setShowProvidesDepends] = useState(false);

  useEffect(() => {
    if (!(artifact.url || gettingUrl) && open) {
      setGettingUrl(true);
    }
  }, [artifact.id, open]);

  useEffect(() => {
    if (gettingUrl) {
      getArtifactUrl(artifact.id).then(() => setGettingUrl(false));
    }
  }, [gettingUrl]);

  const onToggleEditing = useCallback(
    event => {
      event.stopPropagation();
      if (event.keyCode === 13 || !event.keyCode) {
        if (descEdit) {
          // save change
          editArtifact(artifact.id, description);
        }
        setDescEdit(!descEdit);
      }
    },
    [descEdit, description, editArtifact, setDescEdit]
  );

  const softwareItem = extractSoftwareItem(artifact.artifact_provides);
  const softwareInformation = softwareItem
    ? {
        title: 'Software versioning information',
        content: [
          { primary: 'Software filesystem', secondary: softwareItem.key },
          { primary: 'Software name', secondary: softwareItem.name },
          { primary: 'Software version', secondary: softwareItem.version }
        ]
      }
    : { content: [] };

  const artifactMetaInfo = [
    { title: 'Depends', content: transformArtifactCapabilities(artifact.artifact_depends) },
    { title: 'Clears', content: transformArtifactCapabilities(artifact.artifact_clears) },
    { title: 'Provides', content: transformArtifactCapabilities(artifact.artifact_provides) },
    { title: 'Artifact metadata', content: transformArtifactMetadata(artifact.metaData) }
  ];
  const hasMetaInfo = artifactMetaInfo.some(item => !!item.content.length);
  return (
    <div className={artifact.name == null ? 'muted' : null}>
      <List style={{ display: 'grid', gridTemplateColumns: 'calc(600px + 2vw) 300px', gridColumnGap: '2vw' }}>
        <ListItem className={classes.listItemStyle} classes={{ root: 'attributes', disabled: 'opaque' }}>
          <ListItemText
            primary="Description"
            style={{ marginBottom: -3 }}
            primaryTypographyProps={{ style: { marginBottom: 3 } }}
            secondary={
              <Input
                id="artifact-description"
                type="text"
                disabled={!descEdit}
                value={description}
                placeholder="-"
                onKeyDown={onToggleEditing}
                style={{ width: '100%' }}
                onChange={e => setDescription(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton className={classes.editButton} onClick={onToggleEditing} size="large">
                      {descEdit ? <CheckIcon /> : <EditIcon />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            }
            secondaryTypographyProps={{ component: 'div' }}
          />
        </ListItem>
        <ListItem classes={{ root: 'attributes', disabled: 'opaque' }} className={`${classes.listItemStyle} ${classes.listItemStyle.bordered}`}>
          <ListItemText primary="Signed" secondary={artifact.signed ? <CheckCircleOutlineIcon className="green" /> : <CancelOutlinedIcon className="red" />} />
        </ListItem>
      </List>
      <ArtifactMetadataList metaInfo={softwareInformation} />
      <Accordion
        square
        expanded={showPayloads}
        onChange={() => setShowPayloads(toggle)}
        TransitionProps={{ onEntered: onExpansion, onExited: onExpansion }}
        className={classes.accordPanel1}
      >
        <AccordionSummary className={classes.accordSummary}>
          <p>Artifact contents</p>
          <div style={{ marginLeft: 'auto' }}>{showPayloads ? <RemoveIcon /> : <AddIcon />}</div>
        </AccordionSummary>
        <AccordionDetails className={classes.accordSummary}>
          {showPayloads &&
            !!artifact.updates.length &&
            artifact.updates.map((update, index) => <ArtifactPayload index={index} payload={update} key={`artifact-update-${index}`} />)}
        </AccordionDetails>
      </Accordion>
      {hasMetaInfo && (
        <Accordion
          square
          expanded={showProvidesDepends}
          onChange={() => setShowProvidesDepends(!showProvidesDepends)}
          TransitionProps={{ onEntered: onExpansion, onExited: onExpansion }}
          className={classes.accordPanel1}
        >
          <AccordionSummary className={classes.accordSummary}>
            <p>Provides and Depends</p>
            <div style={{ marginLeft: 'auto' }}>{showProvidesDepends ? <RemoveIcon /> : <AddIcon />}</div>
          </AccordionSummary>
          <AccordionDetails className={classes.accordSummary}>
            {showProvidesDepends && artifactMetaInfo.map((info, index) => <ArtifactMetadataList metaInfo={info} key={`artifact-info-${index}`} />)}
          </AccordionDetails>
        </Accordion>
      )}
      <div className="two-columns margin-top-small" style={{ maxWidth: 'fit-content' }}>
        {canManageReleases && (
          <>
            <Button
              href={artifact.url}
              target="_blank"
              disabled={!artifact.url}
              download={artifact.name ? `${artifact.name}.mender` : true}
              startIcon={<ExitToAppIcon style={{ transform: 'rotateZ(90deg)' }} />}
            >
              Download Artifact
            </Button>
            <Button onClick={showRemoveArtifactDialog} startIcon={<CancelIcon className="red auth" />}>
              Remove this Artifact?
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const actionCreators = { getArtifactUrl };

const mapStateToProps = state => {
  const { canManageReleases } = getUserCapabilities(state);
  return {
    canManageReleases
  };
};

export default connect(mapStateToProps, actionCreators)(SelectedArtifact);
