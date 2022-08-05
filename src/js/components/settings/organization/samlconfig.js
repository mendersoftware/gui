import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import CopyToClipboard from 'react-copy-to-clipboard';

// material ui
import { Button, InputAdornment, TextField, Tooltip } from '@mui/material';
import { listItemTextClasses } from '@mui/material/ListItemText';
import { CloudUpload, FileCopyOutlined as CopyPasteIcon } from '@mui/icons-material';

import { makeStyles } from 'tss-react/mui';

import { createFileDownload } from '../../../helpers';
import InfoHint from '../../common/info-hint';
import { maxWidth } from './organizationsettingsitem';
import { useradmApiUrl } from '../../../constants/userConstants';
import ExpandableAttribute from '../../common/expandable-attribute';

const useStyles = makeStyles()(theme => ({
  configDetail: {
    maxWidth,
    [`.${listItemTextClasses.primary}`]: {
      color: theme.palette.text.disabled,
      fontSize: 'smaller'
    }
  },
  textInput: { maxWidth },
  uploadIcon: {
    marginBottom: theme.spacing(-0.5)
  },
  wrapper: {
    alignItems: 'start',
    columnGap: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
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
  const [isHovering, setIsHovering] = useState(false);
  const [isMetadataValid, setIsMetadataValid] = useState(false);

  const onMouseOut = () => setIsHovering(false);
  const onMouseOver = () => setIsHovering(true);

  const config = configs.length ? configs[0] : undefined;
  // eslint-disable-next-line no-unused-vars
  const { id, ...content } = config || {};

  const { classes } = useStyles();

  useEffect(() => {
    setHasSSOConfig(!!config);
    setFileContent(config?.config || '');
    console.log('asdkasjdlasdj kjakjsadk jkaj');
    console.log(!!config);
    console.log(config?.config);
    console.log(config?.id);
    console.log('asdkasjdlasdj kjakjsadk jkaj');
    if (config?.config) {
      setConfigDetails(defaultDetails.map(item => ({ ...item, value: item.getValue(config.id) })));
    }
  }, [config]);

  useEffect(() => {
    if (!fileContent) {
      return;
    }
    const parser = new DOMParser();
    const theDom = parser.parseFromString(fileContent, 'application/xml');
    setIsMetadataValid(!theDom.getElementsByTagName('parsererror').length);
  }, [fileContent]);

  const onCancelSSOSettings = () => {
    setHasSSOConfig(!!config);
    setFileContent(config?.config || '');
    setIsEditing(false);
    onCancel();
  };

  const onCopied = () => setSnackbar('Value copied to clipboard');

  const onMetadataURLChange = ({ target: { value } }) => setFileContent(value);

  const onSaveSSOSettings = () => {
    onSave(id, fileContent);
    setIsEditing(false);
  };

  const onDownloadClick = () => createFileDownload(fileContent, 'metadata.xml');

  const onDrop = acceptedFiles => {
    let reader = new FileReader();
    reader.fileName = acceptedFiles[0].name;
    reader.onerror = error => console.log('Error: ', error);
    reader.onload = () => setFileContent(reader.result);
    reader.readAsBinaryString(acceptedFiles[0]);
  };

  return (
    <>
      <div className={classes.wrapper}>
        <TextField
          className={classes.textInput}
          disabled={hasSSOConfig && !isEditing}
          error={!isMetadataValid && fileContent.length > 4}
          helperText={
            hasSSOConfig ? null : isMetadataValid || fileContent.length < 4 ? (
              <InfoHint content="Submit the metadata document from your Identity Provider" />
            ) : (
              'There was an error parsing the metadata document from your Identity Provider. Please check the supplied metadata.'
            )
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Dropzone multiple={false} onDrop={onDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <a {...getRootProps()}>
                      <input {...getInputProps()} />
                      Or upload a file <CloudUpload className={classes.uploadIcon} fontSize="small" />
                    </a>
                  )}
                </Dropzone>
              </InputAdornment>
            )
          }}
          maxRows={4}
          multiline
          onChange={onMetadataURLChange}
          placeholder="Paste in your metadata document"
          value={fileContent}
        />
        <div className="flexbox">
          {hasSSOConfig && !isEditing ? (
            <Button onClick={setIsEditing}>Edit</Button>
          ) : (
            <>
              <Button onClick={onCancelSSOSettings}>Cancel</Button>
              <Button onClick={onSaveSSOSettings} disabled={!isMetadataValid} variant="contained">
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      {hasSSOConfig && (
        <>
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
          <div className="flexbox center-aligned margin-top" onMouseEnter={onMouseOver} onMouseLeave={onMouseOut}>
            <span className="link small margin-right-small" onClick={onDownloadClick} style={{ lineHeight: '36px' }}>
              Download the Mender SAML metadata document
            </span>
            {isHovering && (
              <CopyToClipboard text={config.config} onCopy={onCopied}>
                <Tooltip title="Copy to clipboard" placement="top" open>
                  <CopyPasteIcon className="clickable" color="primary" fontSize="small" />
                </Tooltip>
              </CopyToClipboard>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default SAMLConfig;
