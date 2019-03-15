import React from 'react';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import AcceptedDevices from './widgets/accepteddevices';
import RedirectionWidget from './widgets/redirectionwidget';
import PendingDevices from './widgets/pendingdevices';

export default class Devices extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.timer = null;
    self.state = {
      devices: [],
      inactiveDevices: [],
      pendingDevices: [],
      deltaActivity: null,
      refreshDevicesLength: 30000,
      showHelptips: AppStore.showHelptips()
    };
    // on render the store might not be updated so we resort to the API and let all later request go through the store
    // to be in sync with the rest of the UI
    AppActions.getAllDevicesByStatus('pending').then(devices => self.setState({ pendingDevices: devices.length }));
    self._refreshDevices().then(result => self.setState(result));
  }
  componentDidMount() {
    var self = this;
    self.timer = setInterval(() => self._refreshDevices().then(result => self.setState(result)), self.state.refreshDevicesLength);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  _refreshDevices() {
    return AppActions.getAllDevicesByStatus('accepted')
      .then(devices => {
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
          }, []).length;
        const deltaActivity = this._updateDeviceActivityHistory(new Date(), yesterday, devices.length);
        return Promise.resolve({ devices: devices.length, inactiveDevices, deltaActivity });
      })
      .then(result => Object.assign(result, { pendingDevices: AppStore.getTotalPendingDevices() }));
  }
  _updateDeviceActivityHistory(today, yesterday, deviceCount) {
    const jsonContent = window.localStorage.getItem('dailyDeviceActivityCount');
    let history = [];
    try {
      history = jsonContent ? JSON.parse(jsonContent) : [];
    } catch (error) {
      console.warn(error);
      window.localStorage.setItem('dailyDeviceActivityCount', JSON.stringify(history));
    }
    const yesterdaysDate = yesterday.toISOString().split('T')[0];
    const todaysDate = today.toISOString().split('T')[0];
    const result = history.reduce(
      (accu, item) => {
        if (item.date < yesterdaysDate) {
          accu.previousCount = item.count;
        }
        if (item.date === todaysDate) {
          accu.newDay = false;
        }
        return accu;
      },
      { previousCount: 0, newDay: true }
    );
    const previousCount = result.previousCount;
    if (result.newDay) {
      history.unshift({ count: deviceCount, date: todaysDate });
    }
    window.localStorage.setItem('dailyDeviceActivityCount', JSON.stringify(history.slice(0, 7)));
    return deviceCount - previousCount;
  }

  render() {
    const { devices, inactiveDevices, pendingDevices, deltaActivity, showHelptips } = this.state;
    const hasPending = pendingDevices > 0;
    const noDevicesAvailable = !devices && !hasPending;
    return (
      <div>
        <h4 className="dashboard-header">
          <span>Devices</span>
        </h4>
        <div style={Object.assign({ marginBottom: '30px', marginTop: '50px' }, this.props.styles)}>
          <PendingDevices pendingDevicesCount={pendingDevices} isActive={hasPending} showHelptips={showHelptips} onClick={this.props.clickHandle} />
          <AcceptedDevices devicesCount={devices} inactiveCount={inactiveDevices} delta={deltaActivity} onClick={this.props.clickHandle} />
          <RedirectionWidget
            target={'/help/connecting-devices'}
            content={'Learn how to connect more devices'}
            buttonContent={'Learn more'}
            onClick={() => this.props.clickHandle({ route: '/help/connecting-devices' })}
            isActive={noDevicesAvailable}
          />
        </div>
      </div>
    );
  }
}
