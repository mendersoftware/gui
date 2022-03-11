import React from 'react';

import { InfoOutlined as InfoIcon } from '@mui/icons-material';

import { MenderTooltipClickable } from '../common/mendertooltip';

const DemoNotification = ({ iconClassName, docsVersion = 'development/', sectionClassName }) => (
  <MenderTooltipClickable
    className={`flexbox centered ${sectionClassName}`}
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
    <>
      <InfoIcon className={iconClassName} style={{ marginRight: 2, verticalAlign: 'bottom' }} />
      <a>Demo mode</a>
    </>
  </MenderTooltipClickable>
);

export default DemoNotification;
