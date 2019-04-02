import React from 'react';
import { Link } from 'react-router-dom';
import SearchInput from 'react-search-input';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

import ScheduleForm from './scheduleform';

export default class ScheduleDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showDevices: false
    };
  }

  searchUpdated() {
    this.setState({ artifact: {} }); // needed to force re-render
  }

  deploymentSettingsUpdate(value, property) {
    this.setState({ [property]: value });
    this.props.deploymentSettings(value, property);
  }

  onScheduleSubmit(group, devices, artifact) {
    this.props.onScheduleSubmit(group, devices, artifact);
    this.setState({ group: '', artifact: {} });
  }

  render() {
    const self = this;
    const { open, onDismiss, filteredDevices, ...other } = this.props;
    var disabled = filteredDevices && filteredDevices.length > 0 ? false : true;

    var tmpDevices = filteredDevices || [];
    if (self.search && filteredDevices) {
      var namefilter = ['id'];
      tmpDevices = filteredDevices.filter(self.search.filter(namefilter));
    }
    var devices = <p>No devices</p>;
    if (tmpDevices) {
      devices = tmpDevices.map((item, index) => {
        var idFilter = `id=${item.id}`;

        return (
          <div className="hint--bottom hint--medium" style={{ width: '100%' }} aria-label={item.id} key={index}>
            <p className="text-overflow">
              <Link to={`/devices/${idFilter}`}>{item.id}</Link>
            </p>
          </div>
        );
      }, this);
    }

    const group = this.props.group && this.props.group !== 'All devices' ? `group=${encodeURIComponent(this.props.group)}` : '';
    const drawerStyles = { overflow: 'hidden', position: 'absolute'};

    var deviceList = (
      <Drawer
        anchor="right"
        PaperProps={{ style: { width: 320, overflow: 'visible', position: 'absolute', padding: '30px 40px' } }}
        BackdropProps={{ style: drawerStyles }}
        ModalProps={{ style: drawerStyles }}
        disablePortal={true}
        open={this.state.showDevices}
      >
        <IconButton
          className="closeSlider"
          onClick={() => this.setState({ showDevices: false })}
          style={{
            fontSize: '16px',
            position: 'absolute',
            left: '-20px',
            top: '20px',
            backgroundColor: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
        <div>
          <SearchInput
            style={{ marginBottom: '8px' }}
            className="search"
            ref={search => (self.search = search)}
            onChange={() => self.searchUpdated()}
            placeholder="Search devices"
          />
          {devices}
          <p className={tmpDevices.length ? 'hidden' : 'italic'}>No devices in this group match the device type or search term.</p>
          <Divider />
          <p>
            <Link to={`/devices/${group}`}>{group ? 'Go to group' : 'Go to devices'}</Link>
          </p>
        </div>
      </Drawer>
    );

    return (
      <Dialog open={open || false} fullWidth={true} maxWidth="sm">
        {deviceList}
        <DialogTitle>Create a deployment</DialogTitle>
        <DialogContent className="dialog">
          <ScheduleForm
            filteredDevices={filteredDevices}
            showDevices={() => this.setState({ showDevices: true })}
            {...other}
            deploymentSettings={(...args) => self.deploymentSettingsUpdate(...args)}
          />
        </DialogContent>
        <DialogActions>
          <Button key="schedule-action-button-1" onClick={onDismiss} style={{ marginRight: '10px', display: 'inline-block' }}>
            Cancel
          </Button>
          <Button
            key="schedule-action-button-2"
            onClick={() => self.onScheduleSubmit(self.state.group, tmpDevices, self.state.artifact)}
            variant="contained"
            color="primary"
            disabled={disabled}
          >
            Create deployment
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
