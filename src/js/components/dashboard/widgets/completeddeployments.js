import React from 'react';
import { makeStyles } from 'tss-react/mui';

import Time from '../../common/time';
import { BaseWidget } from './baseWidget';

const useStyles = makeStyles()(() => ({
  count: { fontSize: 36, marginRight: '1vw' }
}));

export const CompletedDeployments = props => {
  const { classes } = useStyles();
  const { cutoffDate, finishedCount, onClick } = props;
  const widget = {
    header: (
      <div className="flexbox center-aligned">
        <div className={classes.count}>{finishedCount}</div>
        <div>completed</div>
      </div>
    ),
    main: {
      counter: (
        <div className="completionInfo">
          <div>since last login on</div>
          <Time value={cutoffDate} format="YYYY-MM-DD" />
        </div>
      ),
      targetLabel: 'View reports'
    }
  };
  const cutoffDay = cutoffDate.toISOString();
  const route = `deployments/finished?startDate=${cutoffDay.slice(0, cutoffDay.indexOf('T'))}`;
  return !!finishedCount && <BaseWidget {...props} isActive={true} header={widget.header} main={widget.main} onClick={() => onClick({ route })} />;
};

export default CompletedDeployments;
