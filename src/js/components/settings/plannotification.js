import React from 'react';

import Divider from '@material-ui/core/Divider';

const PlanNotification = ({ className = '', currentPlan, defaultPlan = 'Mender Professional' }) => (
  <>
    <div className={`margin-top margin-bottom-small ${className}`}>
      <div className="explanatory-text billing-subtitle">Current plan:</div>
      <div className="flexbox space-between">
        <div>{currentPlan || defaultPlan}</div>
        <a href="https://mender.io/terms/pricing" target="_blank">
          Compare product plans
        </a>
      </div>
    </div>
    <Divider />
  </>
);
export default PlanNotification;
