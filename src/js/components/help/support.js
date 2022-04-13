import React from 'react';
import hubLogo from '../../../assets/img/mender-hub-logo.png';
import { Launch as LaunchIcon } from '@mui/icons-material';

const Support = () => (
  <div>
    <h2>Contact support</h2>
    <p>Do you have a paid plan and need to contact support?</p>
    <p>
      Send an email to{' '}
      <a href="mailto:support@mender.io" target="_blank" rel="noopener noreferrer">
        support@mender.io
      </a>
      , including your organization name and how we can help you.
    </p>
    <h4>Reporting bugs</h4>
    <p>To help us best respond to bug reports, please include:</p>
    <ul>
      <li>Which software versions you are using</li>
      <li>If the issue can be reproduced, what are the steps to reproduce it?</li>
      <li>In case of a UI issue, any screenshots or screen recordings</li>
    </ul>
    <h3>Trial or open source users</h3>
    <div>
      <p>Find technical help at</p>
      <a href="https://hub.mender.io" target="_blank" rel="noopener noreferrer">
        <span>
          <img style={{ 'width': '50%' }} src={hubLogo} />
        </span>
      </a>
      <p>Mender Hub is a forum where you can find help, ask technical questions and start discussions with our active and knowledgeable community.</p>
      <a href="https://hub.mender.io" target="_blank" rel="noopener noreferrer">
        <span>Ask a question at Mender Hub</span> <LaunchIcon style={{ 'verticalAlign': 'text-bottom' }} fontSize="small" />
      </a>
    </div>
  </div>
);
export default Support;
