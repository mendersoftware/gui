import React from 'react';
import hubLogo from '../../../assets/img/mender-hub-logo.png';
import { Launch as LaunchIcon } from '@mui/icons-material';

const MenderHub = () => (
  <div>
    <h3>Find technical help at Mender Hub</h3>
    <a href="https://hub.mender.io" target="_blank" rel="noopener noreferrer">
      <span>
        <img style={{ 'width': '50%' }} src={hubLogo} />
      </span>
    </a>
    <p>
      <a href="https://hub.mender.io" target="_blank" rel="noopener noreferrer">
        Mender Hub
      </a>{' '}
      is a forum where you can ask technical questions and get help from our active and knowledgeable community.
    </p>
    <h4>Board integrations</h4>
    <p>Get help and instructions for integrating Mender with different boards and operating systems.</p>
    <h4>Community-supported resources</h4>
    <p>Find out-of-the-box and community-supported Update Modules and Configuration Scripts, and contribute your own.</p>
    <h4>Tutorials</h4>
    <p>Tutorials and how-to guides for various Mender use-cases including Yocto Project features and practices.</p>
    <h4>Feature requests</h4>
    <p>Submit your feature requests and feedback. Mender is an open source project and we encourage community contributions.</p>
    <p>
      <a href="https://hub.mender.io" target="_blank" rel="noopener noreferrer">
        Visit Mender Hub <LaunchIcon style={{ 'verticalAlign': 'text-bottom' }} fontSize="small" />
      </a>
    </p>
  </div>
);

export default MenderHub;
