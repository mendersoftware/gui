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
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Help as HelpIcon } from '@mui/icons-material';

import { setAllTooltipsReadState, setSnackbar, setTooltipReadState } from '../../actions/appActions';
import { READ_STATES, TIMEOUTS } from '../../constants/appConstants';
import { getShowHelptips, getTooltipsState } from '../../selectors';
import { useDebounce } from '../../utils/debouncehook';
import ConfigurationObject from '../common/configurationobject';
import DocsLink from '../common/docslink';
import { MenderTooltipClickable } from '../common/mendertooltip';

const AuthExplainButton = () => (
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
);

const AuthButton = () => (
  <>
    <h3>Authorize devices</h3>
    <hr />
    <p>
      Expand this section to view the authentication options for this device. You can decide whether to accept it, reject it, or just dismiss this device for
      now.
    </p>
    <p>
      See the documentation for more on <DocsLink path="overview/device-authentication" title="Device authentication" />.
    </p>
  </>
);

const AddGroup = () => (
  <>
    <h3>Device groups</h3>
    <hr />
    <p>
      It is possible to create groups of devices. Once you have created a group and added one or more devices to it, you can deploy an update to that specific
      group only.
    </p>
    <p>To avoid accidents, Mender only allows a device to be in one group at the time.</p>
    <p>
      You can find out additional information about device groups in <Link to="/help/devices">the help section</Link>.
    </p>
  </>
);

const ExpandDevice = () => (
  <>
    <h3>Device inventory</h3>
    <hr />
    <p>
      Mender automatically collects identity and inventory information from connected devices. You can view this information by clicking on a device to expand
      the row.
    </p>
    <p>
      Which information is collected about devices is fully configurable;{' '}
      <DocsLink path="client-installation/identity" title="see the documentation for how to configure this" />.
    </p>
  </>
);

const ExpandArtifact = () => (
  <>
    <h3>Device type compatibility</h3>
    <hr />
    <p>
      Mender Artifacts have <b>Device types compatible</b> as part of their metadata. All devices report which device type they are, as part of their inventory
      information. During a deployment, Mender makes sure that a device will only download and install an Artifact it is compatible with.
    </p>
    <p>You can click on each Artifact in the Release to expand the row and view more information about it.</p>
    <p>
      For more information on how to specify the device type compatibility and other artifact metadata,{' '}
      <DocsLink path="artifact-creation/create-an-artifact" title="see the documentation" />.
    </p>
  </>
);

const DeviceSupportTip = () => (
  <p>
    The steps in the guide should work on most operating systems in the Debian family (e.g. Debian, Ubuntu, Raspberry Pi OS) and devices based on ARMv6 or newer
    (e.g. Raspberry Pi 2/3/4, Beaglebone). Visit <DocsLink path="overview/device-support" title="our documentation" /> for more information about device
    support.
  </p>
);

const ConfigureTimezoneTip = ({ device }) => {
  const { attributes = {} } = device;
  if (!['qemux86-64', 'raspberry', 'rpi'].some(type => attributes.device_type?.some(deviceType => deviceType.startsWith(type)))) {
    return null;
  }
  return (
    <>
      To see the effects of applying a configuration to your device you can set one of the below values to modify the timezone of your device. While all values
      from <i>timedatectl list-timezones</i> will work, to easily see the impact of the changed value you can use one of the following values:
      <ul>
        <li>Europe/Oslo</li>
        <li>America/Los_Angeles</li>
        <li>Asia/Tokyo</li>
      </ul>
      Once the configuration has been applied you can see the effect by opening the Remote Terminal to the device and executing the <i>date</i> command.
    </>
  );
};

const ConfigureRaspberryLedTip = ({ device }) => {
  const { attributes = {} } = device;
  const dispatch = useDispatch();

  if (!['raspberry', 'rpi'].some(type => attributes.device_type?.some(deviceType => deviceType.startsWith(type)))) {
    return null;
  }
  return (
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
        setSnackbar={(...args) => dispatch(setSnackbar(...args))}
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
    </>
  );
};

const ConfigureAddOnTip = () => (
  <p>
    Mender deploys the configuration attributes using the same mechanisms as software updates. The configuration is stored as a JSON file at
    <code>/var/lib/mender-configure/device-config.json</code> on the device and then all the scripts in{' '}
    <code>/usr/lib/mender-configure/apply-device-config.d/</code> are executed to apply the configuration attributes. To add a new configuration attribute, you
    simply need to input it in the UI and add a script to that directory that applies it accordingly. Read more about how it works in the{' '}
    <DocsLink path="add-ons/configure" title="Configure documentation" />.
  </p>
);

const NameTagTip = () => (
  <>
    The <i>Name</i> tag will be available as a device indentifier too.
  </>
);

const NameFilterTip = () => <>Filtering by name is limited to devices with a previously defined name.</>;

const DeviceTypeTip = () => (
  <>
    <p>
      If you don&apos;t see your exact device on the list, choose <i>Generic ARMv6 or newer</i> to continue the tutorial for now.
    </p>
    <p>
      (Note: if your device is <i>not</i> based on ARMv6 or newer, the tutorial won&apos;t work - instead, go back and use the virtual device)
    </p>
  </>
);

const tooltipStateStyleMap = {
  [READ_STATES.read]: 'muted',
  default: ''
};

const TooltipWrapper = ({ content, onClose, onReadAll }) => (
  <div>
    {content}
    <div className="flexbox space-between">
      <span className="link" onClick={onReadAll}>
        Mark all help tips as read
      </span>
      <span className="link" onClick={onClose}>
        Close
      </span>
    </div>
  </div>
);

export const HELPTOOLTIPS = {
  NameTagTip: { id: 'NameTagTip', Component: NameTagTip },
  ConfigureAddOnTip: { id: 'ConfigureAddOnTip', Component: ConfigureAddOnTip },
  ConfigureRaspberryLedTip: { id: 'ConfigureRaspberryLedTip', Component: ConfigureRaspberryLedTip },
  ConfigureTimezoneTip: { id: 'ConfigureTimezoneTip', Component: ConfigureTimezoneTip },
  DeviceSupportTip: { id: 'DeviceSupportTip', Component: DeviceSupportTip },
  ExpandArtifact: { id: 'ExpandArtifact', Component: ExpandArtifact },
  ExpandDevice: { id: 'ExpandDevice', Component: ExpandDevice },
  AddGroup: { id: 'AddGroup', Component: AddGroup },
  AuthButton: { id: 'AuthButton', Component: AuthButton },
  AuthExplainButton: { id: 'AuthExplainButton', Component: AuthExplainButton },
  NameFilterTip: { id: 'NameFilterTip', Component: NameFilterTip },
  DeviceTypeTip: { id: 'DeviceTypeTip', Component: DeviceTypeTip }
};

export const HelpTooltip = ({ anchor = {}, icon = <HelpIcon />, id, contentProps = {}, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const showHelptips = useSelector(getShowHelptips);
  const tooltipsById = useSelector(getTooltipsState);
  const dispatch = useDispatch();
  const debouncedIsOpen = useDebounce(isOpen, TIMEOUTS.threeSeconds);

  const { readState } = tooltipsById[id];
  const { Component, SpecialComponent } = HELPTOOLTIPS[id];

  useEffect(() => {
    if (!debouncedIsOpen) {
      return;
    }
    dispatch(setTooltipReadState(id, READ_STATES.read));
  }, [debouncedIsOpen]);

  const onReadAllClick = () => dispatch(setAllTooltipsReadState(READ_STATES.read));

  if (!showHelptips) {
    return null;
  }

  const title = SpecialComponent ? (
    <SpecialComponent {...contentProps} />
  ) : (
    <TooltipWrapper content={<Component {...contentProps} />} onClose={() => setIsOpen(false)} onReadAll={onReadAllClick} />
  );

  const className = tooltipStateStyleMap[readState] ?? tooltipStateStyleMap.default;
  return (
    <MenderTooltipClickable className={`tooltip help ${className}`} style={anchor} title={title} visibility={isOpen} onOpenChange={setIsOpen} {...props}>
      <div className="tooltip help">{icon}</div>
    </MenderTooltipClickable>
  );
};
