import React from 'react';

import Divider from '@material-ui/core/Divider';

import { Plan } from '../../helpers';

const PlanNotification = ({ className = '', currentPlan = 'os', planClass = '' }) => (
  <>
    <div className={`margin-top margin-bottom-small ${className}`}>
      <div className="explanatory-text billing-subtitle">Current plan:</div>
      <div className="flexbox space-between">
        <Plan className={planClass} plan={currentPlan} />
        <a href="https://mender.io/products/pricing" target="_blank">
          Compare product plans
        </a>
      </div>
    </div>
    <Divider />
  </>
);
export default PlanNotification;
