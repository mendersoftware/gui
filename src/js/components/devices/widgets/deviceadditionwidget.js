import React, { useState } from 'react';

import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon, Launch as LaunchIcon } from '@mui/icons-material';

const buttonStyle = { textTransform: 'none' };

export const DeviceAdditionWidget = ({ docsVersion, onConnectClick, onMakeGatewayClick, onPreauthClick }) => {
  const [anchorEl, setAnchorEl] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = [
    { action: onConnectClick, title: 'Connect a new device', value: 'connect' },
    { action: onPreauthClick, title: 'Preauthorize a device', value: 'preauth' },
    { action: onMakeGatewayClick, title: 'Promote a device to gateway', value: 'makegateway' },
    {
      href: `https://docs.mender.io/${docsVersion}client-installation/overview`,
      rel: 'noopener noreferrer',
      target: '_blank',
      title: 'Learn how to connect devices',
      value: 'learntoconnect'
    }
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
    <>
      <ButtonGroup className="muted device-addition-widget">
        <Button onClick={options[selectedIndex].action} variant="text" style={buttonStyle}>
          {options[selectedIndex].title}
        </Button>
        <Button size="small" onClick={handleToggle} variant="text" style={buttonStyle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Menu id="device-connection-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleToggle} variant="menu">
        {options.map((option, index) =>
          option.href ? (
            <MenuItem {...option} key={option.value} LinkComponent="a">
              {option.title}
              <LaunchIcon style={{ fontSize: '10pt' }} />
            </MenuItem>
          ) : (
            <MenuItem key={option.value} onClick={() => handleSelection(index)} style={buttonStyle}>
              {option.title}
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
};

export default DeviceAdditionWidget;
