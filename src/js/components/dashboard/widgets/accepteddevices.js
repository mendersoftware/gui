import React from 'react';

// material ui
import { CheckCircle as CheckIcon } from '@mui/icons-material';

import { BaseWidget } from './baseWidget';

export const AcceptedDevices = props => {
  const { devicesCount, onClick } = props;
  const onWidgetClick = () => onClick({ route: '/devices/accepted' });

  const widgetMain = {
    counter: devicesCount
  };

  return (
    <BaseWidget
      {...props}
      header={<div className="flexbox center-aligned">Accepted devices {!!devicesCount && <CheckIcon className="margin-left-small green" />}</div>}
      main={widgetMain}
      onClick={onWidgetClick}
    />
  );
};

export default AcceptedDevices;
