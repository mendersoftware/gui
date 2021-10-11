import React from 'react';

// material ui
import { BaseWidget } from './baseWidget';
import LocaleTime from '../../common/localetime';

const headerStyle = { justifyContent: 'flex-end' };
const countStyle = { fontSize: 36, marginRight: '1vw' };

export const CompletedDeployments = props => {
  const { cutoffDate, finishedCount, onClick } = props;
  const widgetMain = {
    header: (
      <div className="flexbox center-aligned" style={headerStyle}>
        <div style={countStyle}>{finishedCount}</div>
        <div>completed</div>
      </div>
    ),
    counter: (
      <div className="completionInfo">
        <div>since last login on</div>
        <LocaleTime value={cutoffDate} />
      </div>
    ),
    targetLabel: 'View reports'
  };
  const cutoffDay = cutoffDate.toISOString();
  const route = `deployments/finished?from=${cutoffDay.slice(0, cutoffDay.indexOf('T'))}`;
  return !!finishedCount && <BaseWidget {...props} isActive={true} main={widgetMain} onClick={() => onClick({ route })} />;
};

export default CompletedDeployments;
