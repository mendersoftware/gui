// Copyright 2023 Northern.tech AS
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
import React, { useEffect, useMemo, useState } from 'react';

import { MenuItem, Select } from '@mui/material';

import Leaflet from 'leaflet';

import { geoAttributes } from '../../../actions/deviceActions';
import { MAX_PAGE_SIZE } from '../../../api/general-api';
import { ALL_DEVICES } from '../../../constants/deviceConstants';
import Map from './map';

const fallbackCenter = [59.913333, 10.738889];

const MapWrapper = ({ groups, groupNames, devicesById, getGroupDevices, getDevicesInBounds }) => {
  const [group, setGroup] = useState(ALL_DEVICES);
  const [bounds, setBounds] = useState();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (groupNames.length && !groupNames.includes(ALL_DEVICES)) {
      setGroup(groupNames[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupNames.join('')]);

  useEffect(() => {
    if (!bounds) {
      getGroupDevices(group, { perPage: MAX_PAGE_SIZE, selectedAttributes: geoAttributes });
      return;
    }
    getDevicesInBounds(bounds, group);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDevicesInBounds, getGroupDevices, group, JSON.stringify(bounds)]);

  const deviceIds = group !== ALL_DEVICES ? groups[group].deviceIds : Object.keys(devicesById);
  useEffect(() => {
    const items = deviceIds.reduce((accu, id) => {
      const device = devicesById[id];
      const { attributes = {} } = device;
      if (attributes['geo-lat']) {
        accu.push({ device, position: [attributes['geo-lat'], attributes['geo-lon']] });
      }
      return accu;
    }, []);
    setItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceIds.join('')]);

  const boundaries = useMemo(() => {
    if (!items.length) {
      return;
    }
    const boundaries = items.reduce((accu, { position }) => {
      accu.push(position);
      return accu;
    }, []);
    return Leaflet.latLngBounds(boundaries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items)]);

  const onGroupSelect = ({ target: { value } }) => {
    setBounds();
    setGroup(value);
  };

  const mapProps = boundaries ? { bounds: boundaries } : { center: fallbackCenter, zoom: 10 };

  return (
    <span>
      <div className="flexbox center-aligned space-between">
        <h4>Device locations</h4>
        <Select labelId="group-selection-label" onChange={onGroupSelect} value={group}>
          {groupNames.map(item => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </div>
      <Map items={items} mapProps={mapProps} onMapMoved={setBounds} />
    </span>
  );
};

export default MapWrapper;
