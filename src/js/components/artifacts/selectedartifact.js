import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Accordion, AccordionDetails, AccordionSummary, IconButton, Input, InputAdornment, List, ListItem, ListItemText } from '@material-ui/core';

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
import { colors } from '../../themes/mender-theme';
import ExpandableAttribute from '../common/expandable-attribute';
import ArtifactPayload from './artifactPayload';

const styles = {
  editButton: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginBottom: '10px'
  },
  listItemStyle: {
    color: '#404041',
    fontSize: '13px',
    marginRight: '2vw',
    minMidth: 200,
    padding: 0
  }
};

export const SelectedArtifact = ({ artifact, editArtifact, getArtifactUrl, onExpansion, showRemoveArtifactDialog }) => {
  const [descEdit, setDescEdit] = useState(false);
  const [description, setDescription] = useState(artifact.description || '-');
  const [gettingUrl, setGettingUrl] = useState(false);
  const [showPayloads, setShowPayloads] = useState(false);

  useEffect(() => {
    if (!artifact.url && !gettingUrl) {
      setGettingUrl(true);
    }
  }, [artifact.id]);
  useEffect(() => {
    if (gettingUrl) {
      getArtifactUrl(artifact.id).then(() => setGettingUrl(false));
    }
  }, [gettingUrl]);

  const onToggleEditing = event => {
    event.stopPropagation();
    if (event.keyCode === 13 || !event.keyCode) {
      if (descEdit) {
        // save change
        editArtifact(artifact.id, description);
      }
      setDescEdit(!descEdit);
    }
  };

  const transformArtifactCapabilities = (capabilities = {}) => {
    return Object.entries(capabilities).reduce((accu, [key, value]) => {
      if (!Array.isArray(value)) {
        accu.push(<ExpandableAttribute key={key} primary={key} secondary={value} />);
      } else if (!key.startsWith('device_type')) {
        // we can expect this to be an array of artifacts or artifact groups this artifact depends on
        const dependencies = value.reduce((dependencies, dependency, index) => {
          const dependencyKey = value.length > 1 ? `${key}-${index + 1}` : key;
          dependencies.push(<ExpandableAttribute key={dependencyKey} primary={dependencyKey} secondary={dependency} />);
          return dependencies;
        }, []);
        accu = [...accu, ...dependencies];
      }
      return accu;
    }, []);
  };

  const transformArtifactMetadata = (metadata = {}) => {
    return Object.entries(metadata).reduce((accu, [key, value]) => {
      const commonProps = { key: key, primary: key, secondaryTypographyProps: { component: 'div' } };
      if (Array.isArray(value)) {
        accu.push(<ExpandableAttribute {...commonProps} secondary={value.length ? value.join(',') : '-'} />);
      } else if (value instanceof Object) {
        accu.push(<ExpandableAttribute {...commonProps} secondary={JSON.stringify(value) || '-'} />);
      } else {
        accu.push(<ExpandableAttribute {...commonProps} secondary={value || '-'} />);
      }
      return accu;
    }, []);
  };

  const extractSoftwareInformation = (capabilities = {}) => {
    return Object.entries(capabilities).reduce((accu, item) => {
      const parts = item[0].split('.');
      if (parts.length > 2 && parts[2].endsWith('.version')) {
        const content = ['Software filesystem', 'Software name', 'Software version'].map((item, index) => (
          <ExpandableAttribute key={`${parts[0]}-info-${index}`} primary={item} secondary={parts[index]} />
        ));
        accu.push({ title: [parts[0]], content });
      }
      return accu;
    }, []);
  };

  const artifactMetaInfo = [
    { title: 'Software versioning information', content: extractSoftwareInformation(artifact.artifact_provides) },
    { title: 'Artifact dependencies', content: transformArtifactCapabilities(artifact.artifact_depends) },
    { title: 'Artifact provides', content: transformArtifactCapabilities(artifact.artifact_provides) },
    { title: 'Artifact metadata', content: transformArtifactMetadata(artifact.metaData) }
  ];
  return (
    <div className={artifact.name == null ? 'muted' : null}>
      <List style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridColumnGap: '2vw' }}>
        <ListItem disabled={true} style={styles.listItemStyle} classes={{ root: 'attributes', disabled: 'opaque' }}>
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
                onKeyDown={onToggleEditing}
                style={{ width: '100%' }}
                onChange={e => setDescription(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton style={styles.editButton} onClick={onToggleEditing}>
                      {descEdit ? <CheckIcon /> : <EditIcon />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            }
            secondaryTypographyProps={{ component: 'div' }}
          />
        </ListItem>
        <ListItem
          classes={{ root: 'attributes', disabled: 'opaque' }}
          disabled={true}
          style={{ ...styles.listItemStyle, borderBottom: '1px solid', borderBottomColor: colors.borderColor }}
        >
          <ListItemText primary="Signed" secondary={artifact.signed ? <CheckCircleOutlineIcon className="green" /> : <CancelOutlinedIcon className="red" />} />
        </ListItem>
      </List>
      {artifactMetaInfo.map(
        (info, index) =>
          !!info.content.length && (
            <React.Fragment key={`artifact-info-${index}`}>
              <p className="margin-bottom-none">{info.title}</p>
              <List className="list-horizontal-flex" style={{ paddingTop: 0 }}>
                {info.content}
              </List>
            </React.Fragment>
          )
      )}
      <Accordion
        square
        expanded={showPayloads}
        onChange={() => setShowPayloads(!showPayloads)}
        TransitionProps={{ onEntered: onExpansion, onExited: onExpansion }}
        style={{ background: '#e9e9e9', borderTop: 'none', padding: '0 15px', margin: '30px 0' }}
      >
        <AccordionSummary style={{ padding: 0 }}>
          <p>Artifact contents</p>
          <div style={{ marginLeft: 'auto' }}>{showPayloads ? <RemoveIcon /> : <AddIcon />}</div>
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0 }}>
          {showPayloads &&
            artifact.updates &&
            artifact.updates.map((update, index) => <ArtifactPayload index={index} payload={update} key={`artifact-update-${index}`} />)}
        </AccordionDetails>
      </Accordion>

      <Button href={artifact.url} target="_blank" disabled={!artifact.url} startIcon={<ExitToAppIcon style={{ transform: 'rotateZ(90deg)' }} />}>
        Download Artifact
      </Button>
      <div className="margin-left inline">
        <Button onClick={() => showRemoveArtifactDialog(true)} startIcon={<CancelIcon className="red auth" />}>
          Remove this Artifact?
        </Button>
      </div>
    </div>
  );
};

const actionCreators = { getArtifactUrl, showRemoveArtifactDialog };

export default connect(null, actionCreators)(SelectedArtifact);
