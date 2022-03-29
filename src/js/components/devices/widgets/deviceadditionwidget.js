import React, { useState } from 'react';

import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowDropDown as ArrowDropDownIcon, Launch as LaunchIcon } from '@mui/icons-material';

const buttonStyle = { textTransform: 'none' };

export const DeviceAdditionWidget = ({ docsVersion, onConnectClick, onMakeGatewayClick, onPreauthClick }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = [
    { action: onConnectClick, title: 'Connect a new device', value: 'connect' },
    { action: onPreauthClick, title: 'Preauthorize a device', value: 'preauth' },
    { action: onMakeGatewayClick, title: 'Promote a device to gateway', value: 'makegateway' }
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
        <Button onClick={options[selectedIndex].action} variant="text" style={buttonStyle}>
          {options[selectedIndex].title}
        </Button>
        <Button size="small" onClick={handleToggle} variant="text" style={buttonStyle}>
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
