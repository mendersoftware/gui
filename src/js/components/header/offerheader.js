import React from 'react';

import { Announcement as AnnouncmentIcon, Close as CloseIcon } from '@mui/icons-material';

const OfferHeader = ({ docsVersion, onHide }) => (
  <div id="offerHeader" className="offerBox">
    <AnnouncmentIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
    <span>
      Learn more about Mender&apos;s new add-ons at&nbsp;
      <a href="https://mender.io/plans/pricing" target="_blank" rel="noreferrer">
        mender.io/plans/pricing
      </a>
      .&nbsp;
      <a href={`https://docs.mender.io/${docsVersion}add-ons/`} target="_blank" rel="noreferrer">
        Visit our documentation
      </a>
      &nbsp;to learn how to enable add-on features
    </span>
    <CloseIcon style={{ marginLeft: '4px', height: '16px', cursor: 'pointer' }} onClick={onHide} />
  </div>
);

export default OfferHeader;
