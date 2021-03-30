import React from 'react';
import ReactTooltip from 'react-tooltip';

import { List } from '@material-ui/core';
import { Info as InfoIcon } from '@material-ui/icons';

import Loader from '../../common/loader';

export const DeviceInventoryLoader = ({ docsVersion = '' }) => (
  <List>
    <div className="waiting-inventory" key="waiting-inventory">
      <div
        onClick={e => e.stopPropagation()}
        id="inventory-info"
        className="tooltip info"
        style={{ top: '8px', right: '8px' }}
        data-tip
        data-for="inventory-wait"
        data-event="click focus"
      >
        <InfoIcon />
      </div>
      <ReactTooltip id="inventory-wait" globalEventOff="click" place="top" type="light" effect="solid" className="react-tooltip">
        <h3>Waiting for inventory data</h3>
        <p>Inventory data not yet received from the device - this can take up to 30 minutes with default installation.</p>
        <p>
          Also see the documentation for{' '}
          <a href={`https://docs.mender.io/${docsVersion}client-installation/configuration-file/polling-intervals`} target="_blank" rel="noopener noreferrer">
            Polling intervals
          </a>
          .
        </p>
      </ReactTooltip>

      <p>Waiting for inventory data from the device</p>
      <Loader show={true} waiting={true} />
    </div>
  </List>
);

export default DeviceInventoryLoader;
