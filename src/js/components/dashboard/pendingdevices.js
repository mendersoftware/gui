import React from 'react';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

// material ui
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { ReviewDevices } from '../helptips/helptooltips';
import Paper from 'material-ui/Paper';

const styles = {};

export class PendingDevices extends React.Component {
  _addDeviceHandle(params) {
    console.log('mehemrh');
    console.log(params);
  }
  render() {
    const hasPending = this.props.isActive;
    const pendingNotification = `${pluralize('devices', hasPending)} pending`;
    return (
      <div>
        <FloatingActionButton mini={true} style={{ marginTop: '10px' }} onClick={() => this._addDeviceHandle()}>
          <ContentAdd />
        </FloatingActionButton>
        <Paper style={this.props.itemStyle} className={hasPending ? 'onboard' : 'hidden'}>
          {this.props.showHelptips ? (
            <div>
              <div id="onboard-1" className="tooltip help highlight" data-tip data-for="review-details-tip" data-event="click focus">
                <FontIcon className="material-icons">help</FontIcon>
              </div>
              <ReactTooltip id="review-details-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                <ReviewDevices devices={hasPending} />
              </ReactTooltip>
            </div>
          ) : null}
          <div>
            <div>
              <p>{this.props.pendingDevices.length}</p>
            </div>
            <div>
              <p>{pendingNotification}</p>
            </div>
            <Link to={'/devices/pending'}>
              <RaisedButton label="View details" />
            </Link>
          </div>
        </Paper>
      </div>
    );
  }
}
