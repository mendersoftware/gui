import React from 'react';

import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

const EnterpriseNotification = props => {
  return (
    !props.isEnterprise && (
      <p className="info icon">
        <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
        {`With a commercial Mender plan you can ${props.benefit}. `}
        <a href="https://mender.io" target="_blank">
          Learn more
        </a>
      </p>
    )
  );
};

export default EnterpriseNotification;
