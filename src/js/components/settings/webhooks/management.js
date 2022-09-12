import React, { useState } from 'react';

// material ui
import { Button, Divider, Drawer, IconButton, Tab, Tabs } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import { emptyWebhook } from '../../../constants/organizationConstants';
import WebhookConfiguration from './configuration';
import WebhookActivity from './activity';

const tabs = ['settings', 'activity'];

export const WebhookManagement = ({ adding, editing, events, eventTotal, getWebhookEvents, onCancel, onSubmit, onRemove, webhook = { ...emptyWebhook } }) => {
  const [currentTab, setCurrentTab] = useState(tabs[0]);

  return (
    <Drawer anchor="right" open={adding || editing} PaperProps={{ style: { minWidth: 600, width: '50vw' } }}>
      <div className="flexbox margin-bottom-small space-between">
        <h3>Manage webhook</h3>
        <div className="flexbox center-aligned">
          <Button color="secondary" onClick={() => onRemove(webhook)}>
            delete webhook
          </Button>
          <IconButton onClick={onCancel} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Divider />
      <Tabs className="margin-top margin-bottom" value={currentTab} onChange={(e, tab) => setCurrentTab(tab)} textColor="primary">
        {tabs.map(key => (
          <Tab key={key} label={<div className="capitalized-start">{key}</div>} value={key} />
        ))}
      </Tabs>
      {currentTab === tabs[0] ? (
        <WebhookConfiguration adding={adding} editing={editing} onCancel={onCancel} onSubmit={onSubmit} webhook={webhook} />
      ) : (
        <WebhookActivity events={events} eventTotal={eventTotal} getWebhookEvents={getWebhookEvents} webhook={webhook} />
      )}
    </Drawer>
  );
};

export default WebhookManagement;
