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

  render() {
    const { open, onDismiss, onScheduleSubmit, filteredDevices, ...other } = this.props;
    var disabled = typeof filteredDevices !== 'undefined' && filteredDevices.length > 0 ? false : true;

    var tmpDevices = [];
    if (this.refs.search && filteredDevices) {
      var namefilter = ['id'];
      tmpDevices = filteredDevices.filter(this.refs.search.filter(namefilter));
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
    const drawerStyles = this.state.showDevices ? { overflow: 'visible', position: 'absolute' } : { overflow: 'hidden', position: 'absolute' };

    var deviceList = (
      <Drawer
        anchor="right"
        PaperProps={{ style: drawerStyles }}
        BackdropProps={{ style: drawerStyles }}
        ModalProps={{ style: drawerStyles }}
        disablePortal={true}
        open={this.state.showDevices}
        // onChange={() => this._showDevices()}
        width={320}
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
        <div style={{ padding: '20px' }}>
          <SearchInput
            style={{ marginBottom: '8px' }}
            className="search"
            ref="search"
            onChange={term => this.searchUpdated(term)}
            placeholder="Search devices"
          />
          {devices}
          <p className={tmpDevices.length ? 'hidden' : 'italic'}>No devices in this group match the device type or search term.</p>
          <Divider />
          <p>
            <Link to={`/devices/${group}`}>{group ? 'Go to group' : 'Go to devices'}></Link>
          </p>
        </div>
      </Drawer>
    );

    return (
      <Dialog open={open} fullWidth={true} maxWidth="md">
        {deviceList}
        <DialogTitle>Create a deployment</DialogTitle>
        <DialogContent className="dialog" style={{ overflow: 'hidden' }}>
          <ScheduleForm filteredDevices={filteredDevices} showDevices={() => this.setState({ showDevices: true })} {...other} />
        </DialogContent>
        <DialogActions>
          <Button key="schedule-action-button-1" onClick={onDismiss} style={{ marginRight: '10px', display: 'inline-block' }}>
            Cancel
          </Button>
          <Button key="schedule-action-button-2" onClick={onScheduleSubmit} variant="contained" color="primary" disabled={disabled}>
            Create deployment
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
