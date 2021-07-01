import React, { useState } from 'react';

import { Button, ButtonGroup, Menu, MenuItem } from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon, Launch as LaunchIcon } from '@material-ui/icons';
import theme from '../../themes/mender-theme';

const buttonStyle = { border: 'none', textTransform: 'none' };

export const DeviceAdditionWidget = ({ docsVersion, onConnectClick, onPreauthClick }) => {
  const [anchorEl, setAnchorEl] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = [
    { action: onConnectClick, title: 'Connect a new device', value: 'connect' },
    { action: onPreauthClick, title: 'Preauthorize a device', value: 'preauth' }
  ];

  const handleToggle = event => {
    const anchor = anchorEl ? null : event?.currentTarget.parentElement;
    setAnchorEl(anchor);
  };

  const handleSelection = index => {
    setSelectedIndex(index);
    handleToggle();
    options[index].action(true);
  };

  return (
    <div className="flexbox column center-aligned padding-small device-addition-widget">
      <ButtonGroup className="muted">
        <Button onClick={options[selectedIndex].action} style={buttonStyle}>
          {options[selectedIndex].title}
        </Button>
        <Button size="small" onClick={handleToggle} style={buttonStyle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Menu id="device-connection-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleToggle} variant="menu">
        {options.map((option, index) => (
          <MenuItem key={`connection-option-${option.value}`} onClick={() => handleSelection(index)} style={buttonStyle}>
            {option.title}
          </MenuItem>
        ))}
      </Menu>
      <a
        className="flexbox centered"
        href={`https://docs.mender.io/${docsVersion}client-installation/overview`}
        rel="noopener noreferrer"
        style={{ marginTop: theme.spacing() }}
        target="_blank"
      >
        Learn how to connect devices
        <LaunchIcon style={{ fontSize: '10pt', marginLeft: theme.spacing(), marginBottom: -2 }} />
      </a>
    </div>
  );
};

export default DeviceAdditionWidget;
