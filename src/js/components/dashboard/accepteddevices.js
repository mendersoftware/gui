import React from 'react';
import { Link } from 'react-router';
import pluralize from 'pluralize';

// material ui
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';
import Paper from 'material-ui/Paper';

const styles = {
  rowStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyItems: 'center'
  },
  columnStyle: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center'
  }
};

export class AcceptedDevices extends React.Component {
  render() {
    const timeframe = '24 Hours';
    const deltaSymbol = this.props.delta > 0 ? '⬆' : '⬇';
    let timeframeNote = 'Active in';
    let activityNotificationText = 'All devices online';
    let notificationSymbol = <CheckCircle />;
    if (this.props.inactiveDevices.length) {
      notificationSymbol = <ReportProblem />;
      timeframeNote = 'Inactive for';
      const inactives = this.props.inactiveDevices.length;
      activityNotificationText = `${inactives} ${pluralize('devices', inactives)} may be offline`;
    }

    return (
      <Link to="/devices">
        <Paper style={this.props.itemStyle}>
          <div>
            <div>{notificationSymbol}</div>
            <div style={styles.columnStyle}>
              <div>
                <p>{activityNotificationText}</p>
              </div>
              <div>
                <p>
                  {timeframeNote} past {timeframe}
                </p>
              </div>
            </div>
          </div>
          <div style={styles.rowStyle}>
            <div>
              <p>{this.props.devices.length}</p>
            </div>
            <div>
              <p>accepted devices</p>
            </div>
          </div>
          {this.props.delta !== 0 ? (
            <div>
              <p>
                {deltaSymbol} {this.props.delta} Last {timeframe}
              </p>
            </div>
          ) : null}
        </Paper>
      </Link>
    );
  }
}
