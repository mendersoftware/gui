import React from 'react';
import BoardIcon from 'react-material-icons/icons/hardware/developer-board';

import AppActions from '../../actions/app-actions';
import { AcceptedDevices } from './accepteddevices';
import { RedirectionWidget } from './redirectionwidget';
import { PendingDevices } from './pendingdevices';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  containedItems: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: '30px',
    marginRight: '2vw',
    height: '175px',
    padding: '30px 15px',
    width: '15vw'
  }
};

export class Devices extends React.Component {
  constructor(props, state) {
    super(props, state);
    const self = this;
    self.setState({ devices: [], inactiveDevices: [], pendingDevices: [], yesterdaysDelta: 0 });
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
    const { devices, inactiveDevices, pendingDevices, yesterdaysDelta } = this.state;
    const hasPending = pendingDevices.length > 0;
    const noDevicesAvailable = !(devices.length && pendingDevices.length);
    return (
      <div>
        <div className="dashboard-header">
          <h2>
            <BoardIcon /> Devices
          </h2>
        </div>
        {/* <div item container direction="row" justify="flex-start" alignItems="flex-end"> */}
        <div style={styles.container}>
          <PendingDevices itemStyle={styles.containedItems} pendingDevices={pendingDevices} isActive={hasPending} showHelptips={this.props.showHelptips} />
          <AcceptedDevices itemStyle={styles.containedItems} devices={devices} inactiveDevices={inactiveDevices} delta={yesterdaysDelta} />
          <RedirectionWidget
            itemStyle={styles.containedItems}
            target={'/help/connecting-devices'}
            content={'Learn how to connect more devices'}
            buttonContent={'Learn more'}
            isActive={noDevicesAvailable}
          />
        </div>
      </div>
    );
  }
}
