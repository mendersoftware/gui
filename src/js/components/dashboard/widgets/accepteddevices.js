import React from 'react';
import pluralize from 'pluralize';

// material ui
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';
import { BaseWidget, styles } from './baseWidget';

const notificationStyles = {
  base: {
    marginRight: '10px',
    height: '14px',
    width: '14px'
  },
  green: { color: '#009E73' }
}

export class AcceptedDevices extends React.Component {

  render() {
    const timeframe = '24 Hours';
    let timeframeNote = 'Active in';
    let activityNotificationText = 'All devices online';
    let notificationSymbol = <CheckCircle style={Object.assign({}, notificationStyles.base, notificationStyles.green)} />;
    if (this.props.inactiveDevices.length) {
      notificationSymbol = <ReportProblem style={notificationStyles.base} className={'warning'} />;
      timeframeNote = 'Inactive for';
      const inactives = this.props.inactiveDevices.length;
      activityNotificationText = `${inactives} ${pluralize('devices', inactives)} may be offline`;
    }

    const widgetHeader = <div style={styles.rowStyle}>
      {notificationSymbol}
      <div style={styles.columnStyle} >
        <div className="hint">{activityNotificationText}</div>
        <div className="tiny">
          {`${timeframeNote} past ${timeframe}`}
        </div>
      </div>
    </div>;

    const widgetMain = {
      header: `Accepted ${pluralize('devices', this.props.devices.length)}`,
      counter: this.props.devices.length
    }

    let widgetFooter;
    if (this.props.delta) {
      const deltaSymbol = this.props.delta > 0 ? '⬆' : '⬇';
      widgetFooter = `${deltaSymbol} ${this.props.delta} Last ${timeframe}`;
    }
    return (
      <BaseWidget
        {...this.props}
        header={widgetHeader}
        main={widgetMain}
        footer={widgetFooter}
        onClick={() => this.props.onClick({ route: 'devices' })} />
    );
  }
}
