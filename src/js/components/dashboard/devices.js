import React from 'react';
import BoardIcon from 'react-material-icons/icons/hardware/developer-board';

import AppActions from '../../actions/app-actions';
import { AcceptedDevices } from './widgets/accepteddevices';
import { RedirectionWidget } from './widgets/redirectionwidget';
import { PendingDevices } from './widgets/pendingdevices';

const styles = {
  container: {
    display: 'flex',
    flexFlow: 'row wrap',
    marginBottom: '50px',
    marginTop: '50px',
    maxWidth: '85vw'
  }
};

export class Devices extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.state = { devices: [], inactiveDevices: [], pendingDevices: [], deltaActivity: null };
    AppActions.getAllDevicesByStatus('pending').then(pendingDevices => self.setState({ pendingDevices }));
    AppActions.getAllDevicesByStatus('accepted').then(devices => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdaysIsoString = yesterday.toISOString();
      const inactiveDevices = devices
        // now boil the list down to the ones that were not updated since yesterday
        .reduce((accu, item) => {
          if (item.updated_ts < yesterdaysIsoString) {
            accu.push(item);
          }
          return accu;
        }, []);
      const deltaActivity = this._updateDeviceActivityHistory(new Date(), yesterday, devices.length);
      self.setState({ devices, inactiveDevices, deltaActivity });
    });
  }

  _updateDeviceActivityHistory(today, yesterday, deviceCount) {
    const jsonContent = window.localStorage.getItem('dailyDeviceActivityCount')
    let history = [];
    try {
      history = jsonContent ? JSON.parse(jsonContent) : [];
    } catch (error) {
      console.warn(error);
      window.localStorage.setItem('dailyDeviceActivityCount', JSON.stringify(history));
    }
    const yesterdaysDate = yesterday.toISOString().split('T')[0];
    const todaysDate = today.toISOString().split('T')[0];
    const result = history.reduce((accu, item) => {
      if (item.date < yesterdaysDate) {
        accu.previousCount = item.count;
      }
      if (item.date === todaysDate) {
        accu.newDay = false;
      }
      return accu;
    }, { previousCount: 0, newDay: true });
    const previousCount = result.previousCount;
    if (result.newDay) {
      history.unshift({ count: deviceCount, date: todaysDate });
    }
    window.localStorage.setItem('dailyDeviceActivityCount', JSON.stringify(history.slice(0, 7)));
    return deviceCount - previousCount;
  }

  render() {
    const { devices, inactiveDevices, pendingDevices, deltaActivity } = this.state;
    const hasPending = pendingDevices.length > 0;
    const noDevicesAvailable = !(devices.length || pendingDevices.length);
    return (
      <div>
        <div className="dashboard-header">
          <h3>
            <BoardIcon /> Devices
          </h3>
        </div>
        <div style={styles.container}>
          <PendingDevices itemStyle={styles.containedItems} pendingDevices={pendingDevices} isActive={hasPending} showHelptips={this.props.showHelptips} onClick={this.props.clickHandle} />
          <AcceptedDevices itemStyle={styles.containedItems} devices={devices} inactiveDevices={inactiveDevices} delta={deltaActivity} onClick={this.props.clickHandle} />
          <RedirectionWidget
            itemStyle={styles.containedItems}
            target={'/help/connecting-devices'}
            content={'Learn how to connect more devices'}
            buttonContent={'Learn more'}
            onClick={() => this.props.clickHandle({ route: 'help/connecting-devices' })}
            isActive={noDevicesAvailable}
          />
        </div>
      </div>
    );
  }
}
