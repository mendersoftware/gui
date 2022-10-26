import React from 'react';
import pluralize from 'pluralize';

// material ui
import { CheckCircle as CheckIcon } from '@mui/icons-material';

import { BaseWidget } from './baseWidget';

export const AcceptedDevices = props => {
  const { delta, devicesCount, offlineThreshold, onClick } = props;
  const onWidgetClick = () => onClick({ route: '/devices/accepted' });

  const timeframe = `${offlineThreshold.interval} ${offlineThreshold.intervalUnit}`;

  const widgetMain = {
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
  return (
    <BaseWidget
      {...props}
      header={
        <div className="flexbox center-aligned">
          Accepted devices <CheckIcon className="margin-left-small green" />
        </div>
      }
      main={widgetMain}
      footer={widgetFooter}
      onClick={onWidgetClick}
    />
  );
};

export default AcceptedDevices;
