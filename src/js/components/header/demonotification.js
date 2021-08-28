import React from 'react';
import ReactTooltip from 'react-tooltip';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';

const DemoNotification = ({ docsVersion = 'development/' }) => (
  <div id="demoBox" className="flexbox centered">
    <a id="demo-info" data-tip data-for="demo-mode" data-event="click focus" data-offset="{'bottom': 15}">
      <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
      Demo mode
    </a>

    <ReactTooltip id="demo-mode" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <h3>Demo mode</h3>
      <p>
        Mender is currently running in <b>demo mode</b>.
      </p>
      <p>
        <a href={`https://docs.mender.io/${docsVersion}server-installation/production-installation-with-kubernetes`} target="_blank" rel="noopener noreferrer">
          See the documentation for help switching to production mode
        </a>
        .
      </p>
    </ReactTooltip>
  </div>
);

export default DemoNotification;
