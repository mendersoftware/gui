import React from 'react';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

// material ui
import FontIcon from 'material-ui/FontIcon';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { ReviewDevices } from '../../helptips/helptooltips';
import { BaseWidget } from './baseWidget';

export class PendingDevices extends React.Component {
  render() {
    const hasPending = this.props.isActive;
    const pendingNotification = `Pending ${pluralize('devices', hasPending)}`;

    const widgetMain = {
      header: pendingNotification,
      counter: this.props.pendingDevices.length,
      targetLabel: 'View details',
      prepend: <div>
        <div id="onboard-1" className="tooltip help highlight" data-tip data-for="review-details-tip" data-event="click focus" style={{ top: '-15px' }}>
          <FontIcon className="material-icons">help</FontIcon>
        </div>
        <ReactTooltip id="review-details-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
          <ReviewDevices devices={hasPending} />
        </ReactTooltip>
      </div>
    };

    return (
      <div style={{ position: 'relative' }}>
        <Link to='/devices/pending' style={{ position: 'absolute', top: '-28px', left: '15px' }}>
          <FloatingActionButton>
            <ContentAdd />
          </FloatingActionButton>
        </Link>
        <BaseWidget
          {...this.props}
          main={widgetMain}
          onClick={() => this.props.onClick({ route: 'devices/pending' })}
        />
      </div>
    );
  }
}
