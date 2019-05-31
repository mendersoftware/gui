import React from 'react';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import AcceptedDevices from './widgets/accepteddevices';
import RedirectionWidget from './widgets/redirectionwidget';
import PendingDevices from './widgets/pendingdevices';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';

export default class Devices extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.timer = null;
    self.state = {
      deltaActivity: null,
      devices: [],
      inactiveDevices: [],
      pendingDevices: [],
      onboardingComplete: AppStore.getOnboardingComplete(),
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
      .then(AppActions.getDevicesWithInventory)
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
    const { devices, inactiveDevices, onboardingComplete, pendingDevices, deltaActivity, showHelptips } = this.state;
    const hasPending = pendingDevices > 0;
    const noDevicesAvailable = !devices && !hasPending;
    let onboardingComponent = null;
    if (this.anchor) {
      const element = this.anchor.children[this.anchor.children.length - 1];
      const anchor = { left: element.offsetLeft + element.offsetWidth / 2, top: element.offsetTop + element.offsetHeight - 50 };
      onboardingComponent = getOnboardingComponentFor('dashboard-onboarding-start', { anchor });
      if (this.pendingsRef) {
        const element = this.pendingsRef.wrappedElement.lastChild;
        const anchor = {
          left: this.pendingsRef.wrappedElement.offsetLeft + element.offsetWidth / 2,
          top: this.pendingsRef.wrappedElement.offsetTop + element.offsetHeight
        };
        onboardingComponent = getOnboardingComponentFor('dashboard-onboarding-pendings', { anchor });
      }
    }
    const redirectionRoute = onboardingComplete ? '/help/getting-started' : '/devices';
    return (
      <div>
        <h4 className="dashboard-header">
          <span>Devices</span>
        </h4>
        <div style={Object.assign({ marginBottom: '30px', marginTop: '50px' }, this.props.styles)} ref={element => (this.anchor = element)}>
          {hasPending ? (
            <PendingDevices
              pendingDevicesCount={pendingDevices}
              isActive={hasPending}
              showHelptips={showHelptips}
              onClick={this.props.clickHandle}
              ref={ref => (this.pendingsRef = ref)}
            />
          ) : null}
          <AcceptedDevices devicesCount={devices} inactiveCount={inactiveDevices} delta={deltaActivity} onClick={this.props.clickHandle} />
          <RedirectionWidget
            target={redirectionRoute}
            content={`Learn how to connect ${onboardingComplete ? 'more devices' : 'a device'}`}
            buttonContent={onboardingComplete ? 'Learn more' : 'Connect a device'}
            onClick={() => {
              if (onboardingComplete) {
                return this.props.clickHandle({ route: redirectionRoute });
              }
              AppActions.setShowConnectingDialog(true);
            }}
            isActive={noDevicesAvailable}
          />
        </div>
        {onboardingComponent ? onboardingComponent : null}
      </div>
    );
  }
}
