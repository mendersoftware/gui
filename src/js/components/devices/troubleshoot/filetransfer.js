// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';

import { FileCopy as CopyPasteIcon } from '@mui/icons-material';
import { Button, IconButton, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { canAccess } from '../../../constants/appConstants';
import FileUpload from '../../common/forms/fileupload';
import InfoText from '../../common/infotext';

const tabs = [
  { key: 'upload', canAccess: ({ userCapabilities: { canTroubleshoot, canWriteDevices } }) => canTroubleshoot && canWriteDevices },
  { key: 'download', canAccess }
];

const maxWidth = 400;

const useStyles = makeStyles()(theme => ({
  column: { maxWidth },
  inputWrapper: { display: 'grid', gridTemplateColumns: `${maxWidth}px max-content` },
  tab: { alignItems: 'flex-start' },
  fileDestination: { marginTop: theme.spacing(2) }
}));

export const FileTransfer = ({ deviceId, downloadPath, file, onDownload, onUpload, setFile, setDownloadPath, setUploadPath, uploadPath, userCapabilities }) => {
  const { classes } = useStyles();
  const [currentTab, setCurrentTab] = useState(tabs[0].key);
  const [isValidDestination, setIsValidDestination] = useState(true);
  const [availableTabs, setAvailableTabs] = useState(tabs);

  useEffect(() => {
    let destination = currentTab === 'download' ? downloadPath : uploadPath;
    const isValid = destination.length ? /^(?:\/|[a-z]+:\/\/)/.test(destination) : true;
    setIsValidDestination(isValid);
  }, [currentTab, downloadPath, uploadPath]);

  useEffect(() => {
    const availableTabs = tabs.reduce((accu, item) => {
      if (item.canAccess({ userCapabilities })) {
        accu.push(item);
      }
      return accu;
    }, []);
    setAvailableTabs(availableTabs);
    setCurrentTab(availableTabs[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userCapabilities)]);

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
      <Tabs orientation="vertical" className="leftFixed" onChange={(e, item) => setCurrentTab(item)} value={currentTab}>
        {availableTabs.map(({ key }) => (
          <Tab className={`${classes.tab} capitalized`} key={key} label={key} value={key} />
        ))}
      </Tabs>
      <div className="rightFluid padding-right">
        {currentTab === 'upload' ? (
          <>
            <InfoText className={classes.column}>Upload a file to the device</InfoText>
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
              style={{ maxWidth }}
            />
            <div className={classes.inputWrapper}>
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
            <div className={`flexbox margin-top ${classes.column}`} style={{ justifyContent: 'flex-end' }}>
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
            <div className={classes.inputWrapper}>
              <TextField
                autoFocus={true}
                className={classes.column}
                error={!isValidDestination}
                fullWidth
                helperText={!isValidDestination && <div className="warning">Destination has to be an absolute path</div>}
                inputProps={{ className: classes.fileDestination }}
                InputLabelProps={{ shrink: true }}
                label="Path to the file on the device"
                onChange={e => setDownloadPath(e.target.value)}
                placeholder="Example: /home/mender/"
                value={downloadPath}
              />
              <Tooltip title="Paste" placement="top">
                <IconButton style={{ alignSelf: 'flex-end' }} onClick={onPasteDownloadClick} size="large">
                  <CopyPasteIcon />
                </IconButton>
              </Tooltip>
            </div>
            <div className={`flexbox margin-top ${classes.column}`} style={{ justifyContent: 'flex-end' }}>
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
