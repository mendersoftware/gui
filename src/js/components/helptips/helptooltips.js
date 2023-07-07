// Copyright 2017 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Help as HelpIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';

import { setSnackbar } from '../../actions/appActions';
import { toggleHelptips } from '../../actions/userActions';
import { getDeviceById } from '../../selectors';
import ConfigurationObject from '../common/configurationobject';
import DocsLink from '../common/docslink';
import MenderTooltip, { MenderTooltipClickable } from '../common/mendertooltip';

const actionCreators = { setSnackbar, toggleHelptips };
const mapStateToProps = (state, ownProps) => ({ device: getDeviceById(state, ownProps.deviceId) });

const HideHelptipsButton = ({ toggleHelptips }) => (
  <p>
    <a className="hidehelp" onClick={toggleHelptips}>
      Hide all help tips
    </a>
  </p>
);

const AuthExplainComponent = () => (
  <MenderTooltipClickable
    placement="left"
    className="absolute clickable"
    style={{ right: 0, top: -70 }}
    title={
      <>
        <h3>Device authorization status</h3>
        <p>
          Each device sends an authentication request containing its identity attributes and its current public key. You can accept, reject or dismiss these
          requests to determine the authorization status of the device.
        </p>
        <p>
          In cases such as key rotation, each device may have more than one identity/key combination listed. See the documentation for more on{' '}
          <DocsLink path="overview/device-authentication" title="Device authentication" />.
        </p>
      </>
    }
  >
    <InfoIcon />
  </MenderTooltipClickable>
);
export const AuthExplainButton = connect(mapStateToProps, actionCreators)(AuthExplainComponent);

const AuthButtonComponent = ({ highlightHelp, toggleHelptips }) => (
  <MenderTooltipClickable
    className={highlightHelp ? 'tooltip help highlight' : 'tooltip help'}
    style={{ left: '75%', top: 0 }}
    title={
      <div style={{ whiteSpace: 'normal' }}>
        <h3>Authorize devices</h3>
        <hr />
        <p>
          Expand this section to view the authentication options for this device. You can decide whether to accept it, reject it, or just dismiss this device
          for now.
        </p>
        <p>
          See the documentation for more on <DocsLink path="overview/device-authentication" title="Device authentication" />.
        </p>
        <HideHelptipsButton toggleHelptips={toggleHelptips} />
      </div>
    }
  >
    <HelpIcon />
  </MenderTooltipClickable>
);
export const AuthButton = connect(mapStateToProps, actionCreators)(AuthButtonComponent);

const AddGroupComponent = ({ toggleHelptips }) => (
  <MenderTooltipClickable
    className="tooltip help"
    style={{ bottom: -10 }}
    title={
      <>
        <h3>Device groups</h3>
        <hr />
        <p>
          It is possible to create groups of devices. Once you have created a group and added one or more devices to it, you can deploy an update to that
          specific group only.
        </p>
        <p>To avoid accidents, Mender only allows a device to be in one group at the time.</p>
        <p>
          You can find out additional information about device groups in <Link to="/help/devices">the help section</Link>.
        </p>
        <HideHelptipsButton toggleHelptips={toggleHelptips} />
      </>
    }
  >
    <HelpIcon />
  </MenderTooltipClickable>
);
export const AddGroup = connect(mapStateToProps, actionCreators)(AddGroupComponent);

const ExpandDeviceComponent = ({ toggleHelptips }) => (
  <MenderTooltipClickable
    className="tooltip help"
    style={{ left: 'inherit', right: '45px' }}
    title={
      <>
        <h3>Device inventory</h3>
        <hr />
        <p>
          Mender automatically collects identity and inventory information from connected devices. You can view this information by clicking on a device to
          expand the row.
        </p>
        <p>
          Which information is collected about devices is fully configurable;{' '}
          <DocsLink path="client-installation/identity" title="see the documentation for how to configure this" />.
        </p>
        <HideHelptipsButton toggleHelptips={toggleHelptips} />
      </>
    }
  >
    <HelpIcon />
  </MenderTooltipClickable>
);
export const ExpandDevice = connect(mapStateToProps, actionCreators)(ExpandDeviceComponent);

const ExpandArtifactComponent = ({ toggleHelptips }) => (
  <MenderTooltipClickable
    className="tooltip help"
    title={
      <>
        <h3>Device type compatibility</h3>
        <hr />
        <p>
          Mender Artifacts have <b>Device types compatible</b> as part of their metadata. All devices report which device type they are, as part of their
          inventory information. During a deployment, Mender makes sure that a device will only download and install an Artifact it is compatible with.
        </p>
        <p>You can click on each Artifact in the Release to expand the row and view more information about it.</p>
        <p>
          For more information on how to specify the device type compatibility and other artifact metadata,{' '}
          <DocsLink path="artifact-creation/create-an-artifact" title="see the documentation" />.
        </p>
        <HideHelptipsButton toggleHelptips={toggleHelptips} />
      </>
    }
  >
    <HelpIcon />
  </MenderTooltipClickable>
);
export const ExpandArtifact = connect(mapStateToProps, actionCreators)(ExpandArtifactComponent);

const DeviceSupportTipComponent = () => (
  <MenderTooltipClickable
    className="tooltip help"
    style={{ bottom: '2.5%', left: '88%' }}
    title={
      <p>
        The steps in the guide should work on most operating systems in the Debian family (e.g. Debian, Ubuntu, Raspberry Pi OS) and devices based on ARMv6 or
        newer (e.g. Raspberry Pi 2/3/4, Beaglebone). Visit <DocsLink path="overview/device-support" title="our documentation" /> for more information about
        device support.
      </p>
    }
  >
    <HelpIcon />
  </MenderTooltipClickable>
);

export const DeviceSupportTip = connect(mapStateToProps, actionCreators)(DeviceSupportTipComponent);

const ConfigureTimezoneTipComponent = ({ anchor, device, toggleHelptips }) => {
  const { attributes = {} } = device;
  if (!['qemux86-64', 'raspberry', 'rpi'].some(type => attributes.device_type?.some(deviceType => deviceType.startsWith(type)))) {
    return null;
  }
  return (
    <MenderTooltipClickable
      className="fadeIn tooltip help"
      style={anchor}
      title={
        <>
          To see the effects of applying a configuration to your device you can set one of the below values to modify the timezone of your device. While all
          values from <i>timedatectl list-timezones</i> will work, to easily see the impact of the changed value you can use one of the following values:
          <ul>
            <li>Europe/Oslo</li>
            <li>America/Los_Angeles</li>
            <li>Asia/Tokyo</li>
          </ul>
          Once the configuration has been applied you can see the effect by opening the Remote Terminal to the device and executing the <i>date</i> command.
          <HideHelptipsButton toggleHelptips={toggleHelptips} />
        </>
      }
    >
      <HelpIcon />
    </MenderTooltipClickable>
  );
};

export const ConfigureTimezoneTip = connect(mapStateToProps, actionCreators)(ConfigureTimezoneTipComponent);

const ConfigureRaspberryLedComponent = ({ anchor, device, setSnackbar, toggleHelptips }) => {
  const { attributes = {} } = device;
  if (!['raspberry', 'rpi'].some(type => attributes.device_type?.some(deviceType => deviceType.startsWith(type)))) {
    return null;
  }
  return (
    <MenderTooltipClickable
      className="fadeIn tooltip help"
      style={anchor}
      title={
        <>
          To see the effects of applying a configuration to your device you can set one of the below values to modify the behaviour of your Raspberry Pi green
          status LED
          <ConfigurationObject
            className="margin-top-small margin-bottom-small"
            config={{
              mmc0: 'The default, which blinks the led on storage activity',
              on: 'Turn on the light permanently',
              off: 'Turn off the light permanently',
              heartbeat: 'Enable heartbeat blinking'
            }}
            compact
            setSnackbar={setSnackbar}
          />
          There are other possible values, but we won&apos;t advertise them here. See
          <a href="http://www.d3noob.org/2020/07/controlling-activity-led-on-raspberry-pi.html" target="_blank" rel="noopener noreferrer">
            this blog post
          </a>{' '}
          or{' '}
          <a href="https://www.raspberrypi.org/forums/viewtopic.php?t=273194#p1658930" target="_blank" rel="noopener noreferrer">
            in the Raspberry Pi forums
          </a>{' '}
          for more information.
          <HideHelptipsButton toggleHelptips={toggleHelptips} />
        </>
      }
    >
      <HelpIcon />
    </MenderTooltipClickable>
  );
};

export const ConfigureRaspberryLedTip = connect(mapStateToProps, actionCreators)(ConfigureRaspberryLedComponent);

const ConfigureAddOnTipComponent = () => (
  <MenderTooltipClickable
    className="tooltip help"
    style={{ top: '10%', left: '75%' }}
    title={
      <p>
        Mender deploys the configuration attributes using the same mechanisms as software updates. The configuration is stored as a JSON file at
        <code>/var/lib/mender-configure/device-config.json</code> on the device and then all the scripts in{' '}
        <code>/usr/lib/mender-configure/apply-device-config.d/</code> are executed to apply the configuration attributes. To add a new configuration attribute,
        you simply need to input it in the UI and add a script to that directory that applies it accordingly. Read more about how it works in the{' '}
        <DocsLink path="add-ons/configure" title="Configure documentation" />.
      </p>
    }
  >
    <HelpIcon />
  </MenderTooltipClickable>
);

export const ConfigureAddOnTip = connect(mapStateToProps, actionCreators)(ConfigureAddOnTipComponent);

export const NameTagTip = () => (
  <MenderTooltip
    arrow
    title={
      <>
        The <i>Name</i> tag will be available as a device indentifier too.
      </>
    }
  >
    <div className="tooltip help" style={{ top: '15%', left: '85%' }}>
      <HelpIcon />
    </div>
  </MenderTooltip>
);
