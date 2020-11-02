import React from 'react';

import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

const EnterpriseNotification = ({ isEnterprise, benefit }) =>
  !isEnterprise && (
    <p className="info icon">
      <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
      {`With a more advanced commercial Mender plan you get access to ${benefit}. Get an overview of the Mender plans on the `}
      <a href="https://mender.io/plans/features" target="_blank" rel="noopener noreferrer">
        features page
      </a>
      .
    </p>
  );

export default EnterpriseNotification;
