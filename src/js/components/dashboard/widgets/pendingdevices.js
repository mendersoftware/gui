import React from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

// material ui
import Fab from '@material-ui/core/Fab';
import ContentAddIcon from '@material-ui/icons/Add';
import HelpIcon from '@material-ui/icons/Help';

import { ReviewDevices } from '../../helptips/helptooltips';
import { BaseWidget } from './baseWidget';

export default class PendingDevices extends React.Component {
  render() {
    const hasPending = this.props.isActive;
    const pendingNotification = `Pending ${pluralize('devices', hasPending)}`;

    const widgetMain = {
      header: pendingNotification,
      counter: this.props.pendingDevicesCount,
      targetLabel: 'View details',
      prepend: (
        <div>
          <div id="onboard-1" className="tooltip help highlight" data-tip data-for="review-details-tip" data-event="click focus" style={{ top: '-15px' }}>
            <HelpIcon />
          </div>
          <ReactTooltip id="review-details-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
            <ReviewDevices devices={hasPending} />
          </ReactTooltip>
        </div>
      )
    };

    return (
      <div style={{ position: 'relative' }}>
        <Fab component={Link} to="/devices/pending" style={{ position: 'absolute', top: '-28px', left: '15px', zIndex: '1' }}>
          <ContentAddIcon />
        </Fab>
        <BaseWidget {...this.props} main={widgetMain} onClick={() => this.props.onClick({ route: 'devices/pending' })} />
      </div>
    );
  }
}
