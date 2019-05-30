import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';

// material ui
import Fab from '@material-ui/core/Fab';
import ContentAddIcon from '@material-ui/icons/Add';

import { BaseWidget } from './baseWidget';

export default class PendingDevices extends React.Component {
  render() {
    const hasPending = this.props.isActive;
    const pendingNotification = `Pending ${pluralize('devices', hasPending)}`;

    const widgetMain = {
      header: pendingNotification,
      counter: this.props.pendingDevicesCount,
      targetLabel: 'View details'
    };

    return (
      <div style={{ position: 'relative' }} ref={ref => (this.wrappedElement = ref)}>
        <Fab color="primary" component={Link} to="/devices/pending" style={{ position: 'absolute', top: '-28px', left: '15px', zIndex: '1' }}>
          <ContentAddIcon />
        </Fab>
        <BaseWidget {...this.props} main={widgetMain} onClick={() => this.props.onClick({ route: 'devices/pending' })} />
      </div>
    );
  }
}
