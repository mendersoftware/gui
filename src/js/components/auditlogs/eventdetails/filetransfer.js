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
import { getDeviceById as getDeviceByIdSelector, getIdAttribute, getUserCapabilities } from '../../../selectors';
import Loader from '../../common/loader';
import DeviceDetails, { DetailInformation } from './devicedetails';

export const FileTransfer = ({ item, onClose }) => {
  const dispatch = useDispatch();
  const {
    actor,
    meta: { path = [] },
    object = {}
  } = item;
  const device = useSelector(state => getDeviceByIdSelector(state, object.id));
  const { canReadDevices } = useSelector(getUserCapabilities);
  const { attribute: idAttribute } = useSelector(getIdAttribute);
  const theme = useTheme();

  useEffect(() => {
    const { object } = item;
    if (!device && canReadDevices) {
      dispatch(getDeviceById(object.id));
    }
  }, [canReadDevices, device, dispatch, item]);

  if (canReadDevices && !device) {
    return <Loader show={true} />;
  }

  const sessionMeta = {
    Path: path.join(','),
    User: actor.email
  };

  return (
    <div className="flexbox column" style={{ margin: theme.spacing(3), minWidth: 'min-content' }}>
      {canReadDevices && <DeviceDetails device={device} idAttribute={idAttribute} onClose={onClose} />}
      <DetailInformation title="file transfer" details={sessionMeta} />
    </div>
  );
};

export default FileTransfer;
