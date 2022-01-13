import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { IconButton, Input, InputAdornment } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Clear as ClearIcon, Check as CheckIcon, Edit as EditIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { setDeviceTags } from '../../actions/deviceActions';

const iconStyle = { fontSize: '1.25rem' };

export const DeviceNameInput = ({ device, isHovered, setSnackbar, setDeviceTags, style = {} }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const { id = '', tags = {} } = device;
  const { name = '' } = tags;

  useEffect(() => {
    if (!isEditing && name !== value) {
      setValue(name);
    }
  }, [device, isEditing]);

  const onSubmit = () => {
    const changedTags = {
      ...tags,
      name: value
    };
    setDeviceTags(id, changedTags).then(() => {
      setSnackbar('Device name changed');
      setIsEditing(false);
    });
  };

  const onCancel = () => {
    setValue(name);
    setIsEditing(false);
  };

  const onStartEdit = e => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const editButton = (
    <IconButton onClick={onStartEdit} size="small">
      <EditIcon style={iconStyle} />
    </IconButton>
  );

  const buttonArea = isEditing ? (
    <>
      <IconButton onClick={onSubmit} size="small">
        <CheckIcon style={iconStyle} />
      </IconButton>
      <IconButton onClick={onCancel} size="small">
        <ClearIcon style={iconStyle} />
      </IconButton>
    </>
  ) : (
    editButton
  );

  const onInputClick = e => e.stopPropagation();

  const textColorStyle = name ? { color: theme.palette.text.primary } : { color: theme.palette.text.main };
  return (
    <Input
      id={`${device.id}-id-input`}
      disabled={!isEditing}
      value={value}
      placeholder={`${id.substring(0, 6)}...`}
      onClick={onInputClick}
      onChange={({ target: { value } }) => setValue(value)}
      style={{ ...style, ...textColorStyle, fontSize: '0.8125rem' }}
      type="text"
      endAdornment={(isHovered || isEditing) && <InputAdornment position="end">{buttonArea}</InputAdornment>}
    />
  );
};

const actionCreators = {
  setDeviceTags,
  setSnackbar
};

export default connect(undefined, actionCreators)(DeviceNameInput);
