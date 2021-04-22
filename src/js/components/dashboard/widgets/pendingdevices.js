import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';

// material ui
import Fab from '@material-ui/core/Fab';
import ContentAddIcon from '@material-ui/icons/Add';

import { BaseWidget } from './baseWidget';

export const PendingDevices = props => {
  const { isActive: hasPending, innerRef, onClick, pendingDevicesCount } = props;
  const onWidgetClick = () => onClick({ route: 'devices/pending' });

  const pendingNotification = `Pending ${pluralize('devices', hasPending)}`;

  const widgetMain = {
    header: pendingNotification,
    counter: pendingDevicesCount,
    targetLabel: 'View details'
  };

  return (
    <div style={{ position: 'relative' }} ref={ref => (innerRef ? (innerRef.current = ref) : null)}>
      <Fab color="primary" component={Link} to="/devices/pending" style={{ position: 'absolute', top: '-28px', left: '15px', zIndex: '1' }}>
        <ContentAddIcon />
      </Fab>
      <BaseWidget {...props} main={widgetMain} onClick={onWidgetClick} />
    </div>
  );
};

export default PendingDevices;
