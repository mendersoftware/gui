import React from 'react';

import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import { PLANS as plans } from '../../constants/appConstants';

const EnterpriseNotification = ({ isEnterprise, benefit, recommendedPlan }) =>
  !isEnterprise && (
    <p className="info icon">
      <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
      {`With a ${recommendedPlan ? plans[recommendedPlan] : 'commercial Mender'} plan you can ${benefit}. `}
      <a href="https://mender.io" target="_blank">
        Learn more
      </a>
    </p>
  );

export default EnterpriseNotification;
