import React from 'react';

import { List } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

import Loader from '../../common/loader';
import { MenderTooltipClickable } from '../../common/mendertooltip';

export const DeviceInventoryLoader = ({ docsVersion = '' }) => (
  <List>
    <div className="waiting-inventory" key="waiting-inventory">
      <MenderTooltipClickable
        placement="left"
        disableFocusListener={false}
        title={
          <>
            <h3>Waiting for inventory data</h3>
            <p>Inventory data not yet received from the device - this can take up to 30 minutes with default installation.</p>
            <p>
              Also see the documentation for{' '}
              <a
                href={`https://docs.mender.io/${docsVersion}client-installation/configuration-file/polling-intervals`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Polling intervals
              </a>
              .
            </p>
          </>
        }
      >
        <InfoIcon />
      </MenderTooltipClickable>
      <p>Waiting for inventory data from the device</p>
      <Loader show={true} waiting={true} />
    </div>
  </List>
);

export default DeviceInventoryLoader;
