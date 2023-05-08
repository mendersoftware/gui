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
  }, [groupNames.join('')]);

  useEffect(() => {
    if (!bounds) {
      getGroupDevices(group, { perPage: MAX_PAGE_SIZE, selectedAttributes: geoAttributes });
      return;
    }
    getDevicesInBounds(bounds, group);
  }, [group, JSON.stringify(bounds)]);

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
