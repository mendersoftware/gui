import React from 'react';

import InfoHint from './info-hint';

const EnterpriseNotification = ({ isEnterprise, benefit }) =>
  !isEnterprise && (
    <InfoHint
      content={
        <>
          {`With a more advanced commercial Mender plan you get access to ${benefit}. Get an overview of the Mender plans on the `}
          <a href="https://mender.io/plans/features" target="_blank" rel="noopener noreferrer">
            features page
          </a>
          .
        </>
      }
    />
  );

export default EnterpriseNotification;
