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
      const inactiveDevices = devices.reduce((accu, device) => {
        console.log(device.updated_ts);
        return accu;
      }, []);
      const yesterdaysDelta = 0;
      self.setState({ devices, inactiveDevices, yesterdaysDelta });
    });
  }

  _clickHandle(params) {
    this.props.clickHandle(params);
  }

  render() {
    const { devices, inactiveDevices, pendingDevices, deltaActivity } = this.state;
    const hasPending = pendingDevices.length > 0;
    const noDevicesAvailable = !(devices.length && pendingDevices.length);
    return (
      <div>
        <div className="dashboard-header">
          <h2>
            <BoardIcon /> Devices
          </h2>
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
