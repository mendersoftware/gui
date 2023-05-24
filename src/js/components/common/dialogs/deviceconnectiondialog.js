import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import docker from '../../../../assets/img/docker.png';
import raspberryPi4 from '../../../../assets/img/raspberrypi4.png';
import raspberryPi from '../../../../assets/img/raspberrypi.png';
import { setDeviceListState } from '../../../actions/deviceActions';
import { DEVICE_STATES } from '../../../constants/deviceConstants';
import { getDocsVersion, getTenantCapabilities } from '../../../selectors';
import InfoText from '../../common/infotext';
import PhysicalDeviceOnboarding from './physicaldeviceonboarding';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';

const useStyles = makeStyles()(theme => ({
  rpiQuickstart: {
    backgroundColor: theme.palette.background.lightgrey
  },
  virtualLogo: { height: 40, marginLeft: theme.spacing(2) }
}));

const DeviceConnectionExplainer = ({ docsVersion, hasMonitor, setOnDevice, setVirtualDevice }) => {
  const { classes } = useStyles();
  return (
    <>
      <p>
        You can connect almost any device and Linux OS with Mender, but to make things simple during evaluation we recommend you use a Raspberry Pi as a test
        device.
      </p>
      <div className={`padding-small padding-top-none rpi-quickstart ${classes.rpiQuickstart}`}>
        <h3>Raspberry Pi quick start</h3>
        <p>We&apos;ll walk you through the steps to connect a Raspberry Pi and deploy your first update with Mender.</p>
        <div className="flexbox column centered">
          <div className="flexbox centered os-list">
            {[raspberryPi, raspberryPi4].map((tile, index) => (
              <img key={`tile-${index}`} src={tile} />
            ))}
          </div>
          <Button variant="contained" color="secondary" onClick={() => setOnDevice(true)}>
            Get Started
          </Button>
        </div>
      </div>
      <div className="two-columns margin-top">
        <div className="padding-small padding-top-none">
          <div className="flexbox center-aligned">
            <h3>Use a virtual device</h3>
            <img src={docker} className={classes.virtualLogo} />
          </div>
          <p className="margin-top-none">Don&apos;t have a Raspberry Pi?</p>
          <p>You can use our Docker-run virtual device to go through the same tutorial.</p>
          {hasMonitor && (
            <InfoText className="slightly-smaller">
              If you want to evaluate our commercial components such as mender-monitor, please use a physical device instead as the virtual client does not
              support these components at this time.
            </InfoText>
          )}
          <a onClick={() => setVirtualDevice(true)}>Try a virtual device</a>
        </div>
        <div className="padding-small padding-top-none">
          <h3>Other devices</h3>
          <div>See the documentation to integrate the following with Mender:</div>
          <ul>
            {[
              { key: 'debian', target: `https://docs.mender.io/${docsVersion}operating-system-updates-debian-family`, title: 'Debian family' },
              { key: 'yocto', target: `https://docs.mender.io/${docsVersion}operating-system-updates-yocto-project`, title: 'Yocto OSes' }
            ].map(item => (
              <li key={item.key}>
                <a href={item.target} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
          Or visit{' '}
          <a href="https://hub.mender.io/c/board-integrations" target="_blank" rel="noopener noreferrer">
            Mender Hub
          </a>{' '}
          and search integrations for your device and OS.
        </div>
      </div>
    </>
  );
};

export const DeviceConnectionDialog = ({ docsVersion, hasMonitor, onboardingDeviceType, onCancel, pendingCount, setDeviceListState }) => {
  const [onDevice, setOnDevice] = useState(false);
  const [progress, setProgress] = useState(1);
  const [virtualDevice, setVirtualDevice] = useState(false);
  const [pendingDevicesCount] = useState(pendingCount);
  const [hasMoreDevices, setHasMoreDevices] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setHasMoreDevices(pendingCount > pendingDevicesCount);
  }, [pendingDevicesCount, pendingCount]);

  useEffect(() => {
    if ((virtualDevice || progress >= 2) && hasMoreDevices && !window.location.hash.includes('pending')) {
      setDeviceListState({ state: DEVICE_STATES.pending });
      navigate('/devices/pending');
    }
  }, [hasMoreDevices, progress, virtualDevice]);

  const onBackClick = () => {
    let updatedProgress = progress - 1;
    if (!updatedProgress) {
      updatedProgress = 1;
      setOnDevice(false);
      setVirtualDevice(false);
    }
    setProgress(updatedProgress);
  };

  const onAdvance = () => {
    setProgress(progress + 1);
  };

  let content = <DeviceConnectionExplainer docsVersion={docsVersion} hasMonitor={hasMonitor} setOnDevice={setOnDevice} setVirtualDevice={setVirtualDevice} />;
  if (onDevice) {
    content = <PhysicalDeviceOnboarding />;
  } else if (virtualDevice) {
    content = <VirtualDeviceOnboarding />;
  }

  return (
    <Dialog open={true} PaperProps={{ sx: { maxWidth: '720px' } }}>
      <DialogTitle>Connecting a device</DialogTitle>
      <DialogContent className="onboard-dialog" style={{ margin: '0 30px' }}>
        {content}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <div style={{ flexGrow: 1 }} />
        {(onDevice || virtualDevice) && (
          <div>
            <Button onClick={onBackClick}>Back</Button>
            {progress < 2 && (!virtualDevice || progress < 1) ? (
              <Button variant="contained" disabled={!(virtualDevice || (onDevice && onboardingDeviceType))} onClick={onAdvance}>
                Next
              </Button>
            ) : (
              <Button variant="contained" onClick={onCancel}>
                Close
              </Button>
            )}
          </div>
        )}
      </DialogActions>
    </Dialog>
  );
};

const actionCreators = { setDeviceListState };

const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state),
    hasMonitor: getTenantCapabilities(state).hasMonitor,
    pendingCount: state.devices.byStatus.pending.total
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceConnectionDialog);
