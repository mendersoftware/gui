import React from 'react';
import pluralize from 'pluralize';

// material ui
import CheckIcon from '@material-ui/icons/CheckCircle';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import { BaseWidget, styles } from './baseWidget';

const notificationStyles = {
  base: {
    marginRight: '10px',
    height: '14px',
    width: '14px'
  },
  green: { color: '#009E73' }
};

export default class AcceptedDevices extends React.Component {
  render() {
    const timeframe = '24h';
    let timeframeNote = 'Active in';
    let activityNotificationText = 'All devices online';
    let notificationSymbol = <CheckIcon style={Object.assign({}, notificationStyles.base, notificationStyles.green)} />;
    if (this.props.inactiveCount) {
      notificationSymbol = <ReportProblemIcon style={notificationStyles.base} className={'warning'} />;
      timeframeNote = 'Inactive for';
      activityNotificationText = `${this.props.inactiveCount} ${pluralize('devices', this.props.inactiveCount)} may be offline`;
    }

    let widgetHeader;
    if (this.props.devicesCount) {
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
      header: `Accepted ${pluralize('devices', this.props.devicesCount)}`,
      counter: this.props.devicesCount
    };

    let widgetFooter;
    if (this.props.delta) {
      let deltaSymbol = '+';
      let deltaNotification = `${pluralize('device', this.props.delta)}`;
      if (this.props.delta < 0) {
        deltaSymbol = '-';
        deltaNotification = `${pluralize('device', this.props.delta)}`;
      }
      widgetFooter = `${deltaSymbol}${this.props.delta} ${deltaNotification} within the last ${timeframe}`;
    }
    return (
      <BaseWidget {...this.props} header={widgetHeader} main={widgetMain} footer={widgetFooter} onClick={() => this.props.onClick({ route: 'devices' })} />
    );
  }
}
