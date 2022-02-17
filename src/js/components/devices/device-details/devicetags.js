import React, { useEffect, useState } from 'react';

import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Edit as EditIcon } from '@mui/icons-material';

import Tracking from '../../../tracking';
import ConfigurationObject from '../../common/configurationobject';
import KeyValueEditor from '../../common/forms/keyvalueeditor';
import { NameTagTip } from '../../helptips/helptooltips';
import DeviceDataCollapse from './devicedatacollapse';

const configHelpTipsMap = {
  name: {
    position: 'right',
    component: NameTagTip
  }
};

export const DeviceTags = ({ device, setDeviceTags, setSnackbar, showHelptips }) => {
  const theme = useTheme();
  const [changedTags, setChangedTags] = useState({});
  const [isEditDisabled, setIsEditDisabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [shouldUpdateEditor, setShouldUpdateEditor] = useState(false);

  const { tags = {} } = device;
  const visibleSectionKey = Object.keys(tags).length ? Object.keys(tags)[0] : '';
  const { [visibleSectionKey]: visibleSection, ...remainderReported } = tags;
  const extendedContentLength = Object.keys(remainderReported).length;
  const hasTags = !!Object.keys(tags).length;

  useEffect(() => {
    setShouldUpdateEditor(!shouldUpdateEditor);
  }, [isEditing]);

  useEffect(() => {
    if (open && !isEditing && !hasTags) {
      setIsEditing(true);
    }
  }, [open, hasTags]);

  const onCancel = () => {
    setIsEditing(false);
    setOpen(false);
    setChangedTags(tags);
  };

  const onStartEdit = e => {
    e.stopPropagation();
    setChangedTags(tags);
    setOpen(true);
    setIsEditing(true);
  };

  const onSubmit = () => {
    Tracking.event({ category: 'devices', action: 'modify_tags' });
    setIsEditDisabled(true);
    return setDeviceTags(device.id, changedTags)
      .then(() => setIsEditing(false))
      .finally(() => setIsEditDisabled(false));
  };

  const helpTipsMap = Object.entries(configHelpTipsMap).reduce((accu, [key, value]) => {
    accu[key] = {
      ...value,
      props: { deviceId: device.id }
    };
    return accu;
  }, {});
  return (
    <DeviceDataCollapse
      header={
        visibleSection &&
        !isEditing && (
          <>
            <ConfigurationObject config={{ [visibleSectionKey]: visibleSection }} setSnackbar={setSnackbar} style={{ marginBottom: 10 }} />
            {!open && !!extendedContentLength && <a onClick={setOpen}>show more</a>}
          </>
        )
      }
      isOpen={open}
      onClick={setOpen}
      title={
        <div className="two-columns">
          <div className="flexbox center-aligned">
            <h4 className="margin-right">Tags</h4>
            {!isEditing && (
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
              inputHelpTipsMap={helpTipsMap}
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
          hasTags && (
            <>
              <ConfigurationObject config={remainderReported} setSnackbar={setSnackbar} />
              <a onClick={() => setOpen(false)}>show less</a>
            </>
          )
        )}
      </div>
    </DeviceDataCollapse>
  );
};

export default DeviceTags;
