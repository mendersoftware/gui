import React from 'react';

import { Divider, Drawer } from '@material-ui/core';
import { HelpOutline as HelpOutlineIcon } from '@material-ui/icons';

import { useTheme } from '@material-ui/core/styles';
import DeviceConfiguration from './eventdetails/deviceconfiguration';
import FileTransfer from './eventdetails/filetransfer';
import PortForward from './eventdetails/portforward';
import TerminalSession from './eventdetails/terminalsession';
import UserChange from './eventdetails/userchange';

const FallbackComponent = ({ item }) => {
  let content = '';
  try {
    content = JSON.stringify(item, null, 2);
  } catch (error) {
    content = `error parsing the logged event:\n${error}`;
  }
  return (
    <div className="code" style={{ whiteSpace: 'pre' }}>
      {content}
    </div>
  );
};

const changeTypes = {
  user: 'user',
  device: 'device'
};

const configChangeDescriptor = {
  set_configuration: 'definition',
  deploy_configuration: 'deployment'
};

const mapChangeToContent = item => {
  const { type } = item.object || {};
  let content = { title: 'Entry details', content: FallbackComponent };
  if (type === changeTypes.user) {
    content = { title: `${item.action}d user`, content: UserChange };
  } else if (type === changeTypes.device && item.action.includes('terminal')) {
    content = { title: 'Remote session log', content: TerminalSession };
  } else if (type === changeTypes.device && item.action.includes('file')) {
    content = { title: 'File transfer', content: FileTransfer };
  } else if (type === changeTypes.device && item.action.includes('portforward')) {
    content = { title: 'Port forward', content: PortForward };
  } else if (type === changeTypes.device && item.action.includes('configuration')) {
    content = { title: `Device configuration ${configChangeDescriptor[item.action] || ''}`, content: DeviceConfiguration };
  } else if (type === changeTypes.device) {
    content = { title: 'Device change', content: FallbackComponent };
  }
  return content;
};

export const EventDetailsDrawer = ({ eventItem = {}, onClose, open }) => {
  const theme = useTheme();
  const { title, content: Component } = mapChangeToContent(eventItem);
  return (
    <Drawer className={`${eventItem ? 'fadeIn' : 'fadeOut'}`} anchor="right" open={open} onClose={onClose}>
      <div className="flexbox space-between margin-top-small margin-bottom">
        <b className="capitalized">{title}</b>
        <HelpOutlineIcon />
      </div>
      <Divider />
      <Component item={eventItem} onClose={onClose} />
      <Divider light style={{ marginTop: theme.spacing(2) }} />
    </Drawer>
  );
};

export default EventDetailsDrawer;
