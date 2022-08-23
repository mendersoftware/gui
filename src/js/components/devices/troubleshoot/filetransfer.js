import React, { useEffect, useState } from 'react';

import { Button, IconButton, List, ListItem, ListItemText, TextField, Tooltip } from '@mui/material';
import { FileCopy as CopyPasteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import FileUpload from '../../common/forms/fileupload';
import InfoText from '../../common/infotext';

const tabs = ['upload', 'download'];

const columnStyle = { maxWidth: 400 };

export const FileTransfer = ({ deviceId, downloadPath, file, onDownload, onUpload, setFile, setDownloadPath, setSnackbar, setUploadPath, uploadPath }) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [isValidDestination, setIsValidDestination] = useState(true);

  useEffect(() => {
    let destination = currentTab === 'download' ? downloadPath : uploadPath;
    const isValid = destination.length ? /^(?:\/|[a-z]+:\/\/)/.test(destination) : true;
    setIsValidDestination(isValid);
  }, [currentTab, downloadPath, uploadPath]);

  const onPasteDownloadClick = async () => {
    const path = await navigator.clipboard.readText();
    setDownloadPath(path);
  };

  const onPasteUploadClick = async () => {
    const path = await navigator.clipboard.readText();
    setUploadPath(path);
  };

  const onFileSelect = selectedFile => {
    let path;
    if (selectedFile) {
      path = `${uploadPath}/${selectedFile.name}`;
    } else {
      path = file && uploadPath.includes(file.name) ? uploadPath.substring(0, uploadPath.lastIndexOf('/')) : uploadPath;
    }
    setUploadPath(path);
    setFile(selectedFile);
  };

  return (
    <div className="tab-container with-sub-panels" style={{ minHeight: '95%' }}>
      <List className="leftFixed">
        {tabs.map(item => (
          <ListItem className={`navLink settingsNav capitalized ${item === currentTab ? 'active' : ''}`} key={item} onClick={() => setCurrentTab(item)}>
            <ListItemText>{item}</ListItemText>
          </ListItem>
        ))}
      </List>
      <div className="rightFluid padding-right">
        {currentTab === 'upload' ? (
          <>
            <InfoText style={columnStyle}>Upload a file to the device</InfoText>
            <FileUpload
              enableContentReading={false}
              fileNameSelection={file?.name}
              onFileChange={() => undefined}
              onFileSelect={onFileSelect}
              placeholder={
                <>
                  Drag here or <a>browse</a> to upload a file
                </>
              }
              setSnackbar={setSnackbar}
              style={columnStyle}
            />
            <div style={{ display: 'grid', gridTemplateColumns: `${columnStyle.maxWidth}px max-content` }}>
              <TextField
                autoFocus={true}
                error={!isValidDestination}
                fullWidth
                helperText={!isValidDestination && <div className="warning">Destination has to be an absolute path</div>}
                inputProps={{ style: { marginTop: 16 } }}
                InputLabelProps={{ shrink: true }}
                label="Destination directory on the device where the file will be transferred"
                onChange={e => setUploadPath(e.target.value)}
                placeholder="Example: /opt/installed-by-single-file"
                value={uploadPath}
              />
              <Tooltip title="Paste" placement="top">
                <IconButton style={{ alignSelf: 'flex-end' }} onClick={onPasteUploadClick} size="large">
                  <CopyPasteIcon />
                </IconButton>
              </Tooltip>
            </div>
            <div className="flexbox margin-top" style={{ ...columnStyle, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={!(file && uploadPath && isValidDestination)}
                onClick={() => onUpload(deviceId, uploadPath, file)}
              >
                Upload
              </Button>
            </div>
          </>
        ) : (
          <>
            <InfoText>Download a file from the device</InfoText>
            <div style={{ display: 'grid', gridTemplateColumns: `${columnStyle.maxWidth}px max-content` }}>
              <TextField
                autoFocus={true}
                error={!isValidDestination}
                fullWidth
                helperText={!isValidDestination && <div className="warning">Destination has to be an absolute path</div>}
                inputProps={{ style: { marginTop: theme.spacing(2) } }}
                InputLabelProps={{ shrink: true }}
                label="Path to the file on the device"
                onChange={e => setDownloadPath(e.target.value)}
                placeholder="Example: /home/pi/"
                value={downloadPath}
                style={columnStyle}
              />
              <Tooltip title="Paste" placement="top">
                <IconButton style={{ alignSelf: 'flex-end' }} onClick={onPasteDownloadClick} size="large">
                  <CopyPasteIcon />
                </IconButton>
              </Tooltip>
            </div>
            <div className="flexbox margin-top" style={{ ...columnStyle, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={!(downloadPath && isValidDestination)}
                onClick={() => onDownload(downloadPath)}
                style={{ alignSelf: 'flex-end' }}
              >
                Download
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileTransfer;
