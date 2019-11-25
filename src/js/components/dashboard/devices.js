import React from 'react';
import { connect } from 'react-redux';

import { getAllDevices, getAllDevicesByStatus, getDeviceCount } from '../../actions/deviceActions';
import { setShowConnectingDialog } from '../../actions/userActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import AcceptedDevices from './widgets/accepteddevices';
import RedirectionWidget from './widgets/redirectionwidget';
import PendingDevices from './widgets/pendingdevices';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';

const refreshDevicesLength = 30000;

export class Devices extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.state = {
      deltaActivity: 0,
      loading: null
    };
    self.timer = null;
  }

  componentDidMount() {
    var self = this;
    self.timer = setInterval(() => self._refreshDevices(), refreshDevicesLength);
    // on render the store might not be updated so we resort to the API and let all later request go through the store
    // to be in sync with the rest of the UI
    self._refreshDevices();
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  _refreshDevices() {
    if (this.state.loading || this.props.devices.length > this.props.deploymentDeviceLimit) {
      return;
    }
    this.props.getAllDevicesByStatus(DEVICE_STATES.accepted);
    this.props.getDeviceCount(DEVICE_STATES.pending);
    this.props.getAllDevices();
    const deltaActivity = this._updateDeviceActivityHistory(this.props.activeDevicesCount);
    this.setState({ deltaActivity });
  }

  _updateDeviceActivityHistory(deviceCount) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date();
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
    const { deltaActivity } = this.state;
    const { devices, inactiveDevicesCount, onboardingComplete, pendingDevicesCount, showHelptips } = this.props;
    const noDevicesAvailable = !(devices.length + pendingDevicesCount > 0);
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
          {!!pendingDevicesCount && (
            <PendingDevices
              pendingDevicesCount={pendingDevicesCount}
              isActive={pendingDevicesCount > 0}
              showHelptips={showHelptips}
              onClick={this.props.clickHandle}
              ref={ref => (this.pendingsRef = ref)}
            />
          )}
          <AcceptedDevices devicesCount={devices.length} inactiveCount={inactiveDevicesCount} delta={deltaActivity} onClick={this.props.clickHandle} />
          <RedirectionWidget
            target={redirectionRoute}
            content={`Learn how to connect ${onboardingComplete ? 'more devices' : 'a device'}`}
            buttonContent={onboardingComplete ? 'Learn more' : 'Connect a device'}
            onClick={() => {
              if (onboardingComplete) {
                return this.props.clickHandle({ route: redirectionRoute });
              }
              setShowConnectingDialog(true);
            }}
            isActive={noDevicesAvailable}
          />
        </div>
        {onboardingComponent ? onboardingComponent : null}
      </div>
    );
  }
}

const actionCreators = { getAllDevices, getAllDevicesByStatus, getDeviceCount, setShowConnectingDialog };

const mapStateToProps = state => {
  return {
    activeDevicesCount: state.devices.byStatus.active.total,
    deploymentDeviceLimit: state.deployments.deploymentDeviceLimit,
    devices: state.devices.byStatus.accepted.deviceIds,
    inactiveDevicesCount: state.devices.byStatus.inactive.total,
    onboardingComplete: state.users.onboarding.complete,
    pendingDevicesCount: state.devices.byStatus.pending.total,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(Devices);
