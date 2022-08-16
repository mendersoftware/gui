import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';

// material ui
import { Button } from '@mui/material';
import { listItemTextClasses } from '@mui/material/ListItemText';
import { CloudUpload } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import InfoHint from '../../common/info-hint';
import { maxWidth } from './organizationsettingsitem';
import { useradmApiUrl } from '../../../constants/userConstants';
import ExpandableAttribute from '../../common/expandable-attribute';
import SSOEditor from './ssoeditor';

const useStyles = makeStyles()(theme => ({
  configDetail: {
    maxWidth,
    [`.${listItemTextClasses.primary}`]: {
      color: theme.palette.text.disabled,
      fontSize: 'smaller'
    }
  },
  uploadIcon: {
    marginBottom: theme.spacing(-0.5),
    marginRight: theme.spacing()
  },
  tinyMargin: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5)
  },
  wrapper: {
    alignItems: 'start',
    columnGap: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: `minmax(max-content, ${maxWidth}px) max-content max-content`,
    ['&.has-sso']: {
      gridTemplateColumns: `${maxWidth - 45}px 1fr`
    }
  }
}));

const defaultDetails = [
  { key: 'entityID', label: 'Entity ID', getValue: id => `${window.location.origin}${useradmApiUrl}/sso/sp/metadata/${id}` },
  { key: 'acs', label: 'ACS URL', getValue: id => `${window.location.origin}${useradmApiUrl}/auth/sso/${id}/acs` },
  { key: 'startURL', label: 'Start URL', getValue: id => `${window.location.origin}${useradmApiUrl}/auth/sso/${id}/login` }
];

export const SAMLConfig = ({ configs, onCancel, onSave, setSnackbar }) => {
  const [configDetails, setConfigDetails] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [hasSSOConfig, setHasSSOConfig] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const config = configs.length ? configs[0] : undefined;
  const { id, ...content } = config || {};
  const configContent = content.config || '';

  const { classes } = useStyles();

  useEffect(() => {
    setHasSSOConfig(!!config);
    setFileContent(configContent);
    if (config?.config) {
      setConfigDetails(defaultDetails.map(item => ({ ...item, value: item.getValue(config.id) })));
    }
  }, [config, configContent]);

  const onCancelSSOSettings = () => {
    setHasSSOConfig(!!config);
    setFileContent(configContent);
    setIsEditing(false);
    onCancel();
  };

  const onSaveSSOSettings = () => {
    onSave(id, fileContent);
    setIsEditing(false);
  };

  const onDrop = acceptedFiles => {
    let reader = new FileReader();
    reader.fileName = acceptedFiles[0].name;
    reader.onerror = error => console.log('Error: ', error);
    reader.onload = () => {
      setIsEditing(true);
      setFileContent(reader.result);
    };
    reader.readAsBinaryString(acceptedFiles[0]);
  };

  const onOpenEditorClick = () => setIsEditing(current => !current);

  return (
    <>
      <div className={`flexbox center-aligned ${classes.wrapper} ${hasSSOConfig ? 'has-sso' : ''}`}>
        {hasSSOConfig ? (
          <a onClick={onOpenEditorClick}>View metadata in the text editor</a>
        ) : (
          <>
            <Dropzone multiple={false} onDrop={onDrop}>
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className="dropzone onboard dashboard-placeholder flexbox centered">
                  <input {...getInputProps()} />
                  <CloudUpload className={classes.uploadIcon} fontSize="small" /> Drag here or <a className={classes.tinyMargin}>browse</a> to upload a metadata
                  document
                </div>
              )}
            </Dropzone>
            <div>
              or <a onClick={onOpenEditorClick}>input with the text editor</a>
            </div>
          </>
        )}
        <div className="flexbox">
          {hasSSOConfig && !isEditing ? (
            <Button onClick={onOpenEditorClick}>Edit</Button>
          ) : (
            <>
              <Button onClick={onCancelSSOSettings}>Cancel</Button>
              <Button className={classes.tinyMargin} onClick={onSaveSSOSettings} disabled={!fileContent} variant="contained">
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      {hasSSOConfig ? (
        <div className="flexbox column margin-top">
          {configDetails.map(item => (
            <ExpandableAttribute
              className={classes.configDetail}
              copyToClipboard
              key={item.key}
              primary={item.label}
              secondary={item.value}
              setSnackbar={setSnackbar}
              disableGutters
              dividerDisabled
            />
          ))}
        </div>
      ) : (
        <InfoHint content="Submit the metadata document from your Identity Provider" />
      )}
      <SSOEditor
        open={isEditing}
        config={configContent}
        fileContent={fileContent}
        hasSSOConfig={hasSSOConfig}
        onCancel={onCancelSSOSettings}
        onClose={onOpenEditorClick}
        onSave={onSaveSSOSettings}
        setFileContent={setFileContent}
      />
    </>
  );
};

export default SAMLConfig;
