import React from 'react';

import { Divider, Drawer } from '@material-ui/core';
import { HelpOutline as HelpOutlineIcon } from '@material-ui/icons';

import theme from '../../themes/mender-theme';

import TerminalSession from './eventdetails/terminalsession';
import UserChange from './eventdetails/userchange';

const FallbackComponent = ({ item }) => JSON.stringify(item);

const mapChangeToContent = item => {
  const { type } = item.object || {};
  let content = { title: 'Entry details', content: FallbackComponent };
  if (type === 'user') {
    content = { title: `${item.action}d user`, content: UserChange };
  } else if (type === 'device' && item.action.includes('terminal')) {
    content = { title: 'Remote session log', content: TerminalSession };
  } else if (type === 'device') {
    content = { title: 'Device change', content: FallbackComponent };
  }
  return content;
};

export const EventDetailsDrawer = ({ eventItem = {}, onClose, open }) => {
  const { title, content: Component } = mapChangeToContent(eventItem);
  return (
    <Drawer className={`${eventItem ? 'fadeIn' : 'fadeOut'}`} anchor="right" open={open} onClose={onClose}>
      <div className="flexbox space-between margin-top-small margin-bottom">
        <b className="capitalized">{title}</b>
        <HelpOutlineIcon />
      </div>
      <Divider light style={{ marginBottom: theme.spacing(3) }} />
      <Component item={eventItem} />
      <Divider light style={{ marginTop: theme.spacing(2) }} />
    </Drawer>
  );
};

export default EventDetailsDrawer;
