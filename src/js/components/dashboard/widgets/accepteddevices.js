import React from 'react';
import pluralize from 'pluralize';

// material ui
import { CheckCircle as CheckIcon, ReportProblem as ReportProblemIcon } from '@material-ui/icons';

import { colors } from '../../../themes/Mender';
import { BaseWidget, styles } from './baseWidget';

const notificationStyles = {
  base: {
    marginRight: 10,
    height: 14,
    width: 14
  },
  green: { color: colors.successStyleColor }
};

export const AcceptedDevices = props => {
  const { delta, deviceLimit, devicesCount, inactiveCount, onClick } = props;
  const onWidgetClick = () => onClick({ route: '/devices/accepted' });

  const timeframe = '24h';
  let timeframeNote = 'Active in';
  let activityNotificationText = 'All devices online';
  let notificationSymbol = <CheckIcon style={{ ...notificationStyles.base, ...notificationStyles.green }} />;
  if (inactiveCount) {
    notificationSymbol = <ReportProblemIcon style={notificationStyles.base} className="warning" />;
    timeframeNote = 'Inactive for';
    activityNotificationText = `${inactiveCount} ${pluralize('devices', inactiveCount)} may be offline`;
  }

  let widgetHeader;
  if (devicesCount && devicesCount < deviceLimit) {
    widgetHeader = (
      <div style={styles.rowStyle}>
        {notificationSymbol}
        <div style={styles.columnStyle}>
          <div className="hint">{activityNotificationText}</div>
          <div className="tiny">{`${timeframeNote} past ${timeframe}`}</div>
        </div>
      </div>
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
