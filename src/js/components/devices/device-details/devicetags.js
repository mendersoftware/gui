import React, { useEffect, useState } from 'react';

import { Edit as EditIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { toggle } from '../../../helpers';
import Tracking from '../../../tracking';
import ConfigurationObject from '../../common/configurationobject';
import KeyValueEditor from '../../common/forms/keyvalueeditor';
import DeviceDataCollapse from './devicedatacollapse';

export const DeviceTags = ({ device, setDeviceTags, setSnackbar, showHelptips, userCapabilities }) => {
  const { canWriteDevices } = userCapabilities;
  const theme = useTheme();
  const [changedTags, setChangedTags] = useState({});
  const [isEditDisabled, setIsEditDisabled] = useState(!canWriteDevices);
  const [isEditing, setIsEditing] = useState(false);
  const [shouldUpdateEditor, setShouldUpdateEditor] = useState(false);

  const { tags = {} } = device;
  const hasTags = !!Object.keys(tags).length;

  useEffect(() => {
    setShouldUpdateEditor(toggle);
  }, [isEditing]);

  useEffect(() => {
    if (canWriteDevices) {
      setIsEditing(!hasTags);
    }
  }, [hasTags, canWriteDevices]);

  const onCancel = () => {
    setIsEditing(false);
    setChangedTags(tags);
  };

  const onStartEdit = e => {
    e.stopPropagation();
    setChangedTags(tags);
    setIsEditing(true);
  };

  const onSubmit = () => {
    Tracking.event({ category: 'devices', action: 'modify_tags' });
    setIsEditDisabled(true);
    return setDeviceTags(device.id, changedTags)
      .then(() => setIsEditing(false))
      .finally(() => setIsEditDisabled(false));
  };

  return (
    <DeviceDataCollapse
      title={
        <div className="two-columns">
          <div className="flexbox center-aligned">
            <h4 className="margin-right">Tags</h4>
            {!isEditing && canWriteDevices && (
              <Button onClick={onStartEdit} startIcon={<EditIcon />} size="small">
                Edit
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="relative" style={{ maxWidth: 700 }}>
        {isEditing ? (
          <>
            <KeyValueEditor
              disabled={isEditDisabled}
              errortext=""
              input={changedTags}
              onInputChange={setChangedTags}
              reset={shouldUpdateEditor}
              showHelptips={showHelptips}
            />
            <div className="flexbox center-aligned margin-bottom-small" style={{ justifyContent: 'flex-end' }}>
              <Button color="primary" onClick={onSubmit} variant="contained" style={{ marginRight: theme.spacing(2) }}>
                Save
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </div>
          </>
        ) : (
          hasTags && <ConfigurationObject config={tags} setSnackbar={setSnackbar} />
        )}
      </div>
    </DeviceDataCollapse>
  );
};

export default DeviceTags;
