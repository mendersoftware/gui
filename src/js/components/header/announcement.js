import React from 'react';
import Linkify from 'react-linkify';

import { Announcement as AnnounceIcon, Close as CloseIcon } from '@material-ui/icons';

const Announcement = ({ announcement, onHide, showAnnouncement }) => (
  <div id="announcement" className={`flexbox centered ${showAnnouncement ? 'fadeInSlow' : 'fadeOutSlow'}`}>
    <AnnounceIcon className="red" style={{ marginRight: '4px', height: '18px', minWidth: '24px' }} />
    <p>
      <Linkify properties={{ target: '_blank' }}>{announcement}</Linkify>
    </p>
    <CloseIcon style={{ marginLeft: '4px', height: '16px', cursor: 'pointer' }} onClick={onHide} />
  </div>
);

export default Announcement;
