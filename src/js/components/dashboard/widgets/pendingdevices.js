import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';

// material ui
import { Fab } from '@mui/material';
import { Add as ContentAddIcon } from '@mui/icons-material';

import { BaseWidget } from './baseWidget';
import { onboardingSteps } from '../../../utils/onboardingmanager';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  fab: { top: '-28px', right: theme.spacing(2), zIndex: 1 }
}));

export const PendingDevices = props => {
  const { advanceOnboarding, isActive: hasPending, innerRef, onboardingState, onClick, pendingDevicesCount } = props;

  const { classes } = useStyles();

  const onWidgetClick = () => {
    if (!onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEVICES_PENDING_ONBOARDING);
    }
    onClick({ route: '/devices/pending' });
  };

  const pendingNotification = `Pending ${pluralize('devices', hasPending)}`;

  const widgetMain = {
    counter: pendingDevicesCount,
    targetLabel: 'View details'
  };

  return (
    <div className="relative" ref={ref => (innerRef ? (innerRef.current = ref) : null)}>
      <Fab className={`absolute ${classes.fab}`} color="primary" component={Link} to="/devices/pending">
        <ContentAddIcon />
      </Fab>
      <BaseWidget {...props} header={pendingNotification} main={widgetMain} onClick={onWidgetClick} />
    </div>
  );
};

export default PendingDevices;
