import React from 'react';
import pluralize from 'pluralize';

// material ui
import { CheckCircle as CheckIcon, ReportProblem as ReportProblemIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import { BaseWidget } from './baseWidget';

const useStyles = makeStyles()(theme => ({
  base: {
    marginRight: 10,
    height: 14,
    width: 14
  },
  green: { color: theme.palette.success.main }
}));

export const AcceptedDevices = props => {
  const { classes } = useStyles();
  const { delta, deviceLimit, devicesCount, inactiveCount, onClick } = props;
  const onWidgetClick = () => onClick({ route: '/devices/accepted' });

  const timeframe = '24h';
  let timeframeNote = 'Active in';
  let activityNotificationText = 'All devices online';
  let notificationSymbol = <CheckIcon className={`${classes.base} ${classes.green}`} />;
  if (inactiveCount) {
    notificationSymbol = <ReportProblemIcon className={`${classes.base} warning`} />;
    timeframeNote = 'Inactive for';
    activityNotificationText = `${inactiveCount} ${pluralize('devices', inactiveCount)} may be offline`;
  }

  let widgetHeader;
  if (devicesCount && devicesCount < deviceLimit) {
    widgetHeader = (
      <>
        {notificationSymbol}
        <div className="flexbox column">
          <div className="hint">{activityNotificationText}</div>
          <div className="tiny">{`${timeframeNote} past ${timeframe}`}</div>
        </div>
      </>
    );
  }

  const widgetMain = {
    header: `Accepted ${pluralize('devices', devicesCount)}`,
    counter: devicesCount
  };

  let widgetFooter;
  if (delta) {
    let deltaSymbol = '+';
    let deltaNotification = `${pluralize('device', delta)}`;
    if (delta < 0) {
      deltaSymbol = '-';
      deltaNotification = `${pluralize('device', delta)}`;
    }
    widgetFooter = `${deltaSymbol}${delta} ${deltaNotification} within the last ${timeframe}`;
  }
  return <BaseWidget {...props} header={widgetHeader} main={widgetMain} footer={widgetFooter} onClick={onWidgetClick} />;
};

export default AcceptedDevices;
