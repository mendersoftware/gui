// Copyright 2021 Northern.tech AS
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
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '@mui/material/styles';

import { getDeviceById } from '../../../actions/deviceActions';
import { getAuditlogDevice, getIdAttribute, getUserCapabilities } from '../../../selectors';
import Loader from '../../common/loader';
import DeviceDetails, { DetailInformation } from './devicedetails';

export const DeviceConfiguration = ({ item, onClose }) => {
  const { object = {} } = item;
  const { canReadDevices } = useSelector(getUserCapabilities);
  const device = useSelector(getAuditlogDevice);
  const { attribute: idAttribute } = useSelector(getIdAttribute);
  const dispatch = useDispatch();

  const theme = useTheme();
  useEffect(() => {
    if (canReadDevices) {
      dispatch(getDeviceById(object.id));
    }
  }, [canReadDevices, dispatch, object.id]);

  if (canReadDevices && !device.id) {
    return <Loader show={true} />;
  }

  const { actor, change } = item;

  let config;
  try {
    config = JSON.parse(change);
  } catch (error) {
    config = { error: `An error occurred processing the changed config:\n${error}` };
  }

  return (
    <div className="flexbox column" style={{ margin: theme.spacing(3), minWidth: 'min-content' }}>
      {canReadDevices && <DeviceDetails device={device} idAttribute={idAttribute} onClose={onClose} />}
      <DetailInformation title="changed configuration" details={config} />
      <DetailInformation title="change" details={{ User: actor.email }} />
    </div>
  );
};

export default DeviceConfiguration;
