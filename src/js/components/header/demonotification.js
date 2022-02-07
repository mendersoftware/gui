import React from 'react';

import { InfoOutlined as InfoIcon } from '@mui/icons-material';

import { MenderTooltipClickable } from '../common/mendertooltip';

const DemoNotification = ({ docsVersion = 'development/' }) => (
  <MenderTooltipClickable
    title={
      <>
        <h3>Demo mode</h3>
        <p>
          Mender is currently running in <b>demo mode</b>.
        </p>
        <p>
          <a
            href={`https://docs.mender.io/${docsVersion}server-installation/production-installation-with-kubernetes`}
            target="_blank"
            rel="noopener noreferrer"
          >
            See the documentation for help switching to production mode
          </a>
          .
        </p>
      </>
    }
  >
    <div id="demoBox" className="flexbox centered">
      <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
      <a>Demo mode</a>
    </div>
  </MenderTooltipClickable>
);

export default DemoNotification;
