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
import React, { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AttributionControl, MapContainer, Marker, TileLayer, Tooltip, ZoomControl, useMapEvent } from 'react-leaflet';

import { WifiOffOutlined } from '@mui/icons-material';
import { Avatar, Chip, avatarClasses, chipClasses } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { createPathComponent } from '@react-leaflet/core';
import Leaflet from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';

import { TIMEOUTS } from '../../../constants/appConstants';
import { useDebounce } from '../../../utils/debouncehook';
import PinIcon from './pin.svg';

const tileLayer = {
  attribution: '',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};

const sharedStyle = { border: 'none', boxShadow: 'none', borderRadius: 12, lineHeight: '8px' };

const useStyles = makeStyles()(theme => ({
  avatar: {
    [`&.${avatarClasses.root}`]: {
      backgroundColor: theme.palette.primary.main
    },
    marginBottom: 4
  },
  new: {
    [`&.${chipClasses.root}`]: { backgroundColor: theme.palette.grey[900], color: theme.palette.common.white },
    '&.leaflet-tooltip': { ...sharedStyle, backgroundColor: theme.palette.grey[900], color: theme.palette.common.white },
    '&.leaflet-tooltip:before': { visibility: 'collapse' },
    'svg g, svg path': { stroke: theme.palette.primary.main }
  },
  offline: {
    [`&.${chipClasses.root}`]: { backgroundColor: theme.palette.error.main, color: theme.palette.common.white, cursor: 'pointer' },
    [`&.${chipClasses.root} .${chipClasses.deleteIcon}, &.${chipClasses.root} .${chipClasses.deleteIcon}:hover`]: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.common.white
    },
    '&.leaflet-tooltip': { ...sharedStyle, backgroundColor: theme.palette.error.main, color: theme.palette.common.white },
    '&.leaflet-tooltip:before': { visibility: 'collapse' },
    'svg g': { stroke: theme.palette.error.main }
  }
}));

const DeviceClusterIcon = ({ classes, devices }) => {
  const clusterState = devices.reduce(
    (accu, device) => {
      if (device.isOffline) {
        return { ...accu, offline: accu.offline + 1 };
      } else if (device.isNew) {
        return { ...accu, new: accu.new + 1 };
      }
      return accu;
    },
    { offline: 0, new: 0 }
  );
  const offline = clusterState.offline && clusterState.offline >= clusterState.new;
  const needsContext = !!(clusterState.offline || clusterState.new);
  const className = getMarkerClass({ isOffline: !!clusterState.offline, isNew: clusterState.new }, classes);
  return (
    <div className="flexbox column centered">
      <Avatar className={`${classes.avatar} small`}>{devices.length}</Avatar>
      {needsContext &&
        (offline ? (
          <Chip size="small" className={className} label={clusterState.offline} deleteIcon={<WifiOffOutlined />} onDelete={() => {}} />
        ) : (
          <Chip size="small" label={`${clusterState.new} new`} />
        ))}
    </div>
  );
};

const MarkerClusterGroup = createPathComponent((props, context) => {
  // Splitting props and events to different objects
  const { clusterEvents, clusterProps } = Object.entries(props).reduce(
    (accu, [propName, prop]) => {
      propName.startsWith('on') ? (accu.clusterEvents[propName] = prop) : (accu.clusterProps[propName] = prop);
      return accu;
    },
    { clusterProps: {}, clusterEvents: {} }
  );

  // use event listener names that we selected above starting with `on` + map them to their handler
  const markerClusterGroup = Object.entries(clusterEvents).reduce((accu, [eventName, handler]) => {
    const clusterEvent = `cluster${eventName.substring(2).toLowerCase()}`;
    accu.on(clusterEvent, handler);
    return accu;
  }, Leaflet.markerClusterGroup(clusterProps));

  return {
    instance: markerClusterGroup,
    context: { ...context, layerContainer: markerClusterGroup }
  };
});

const MarkerContext = ({ device }) => {
  if (device.isOffline) {
    return <WifiOffOutlined />;
  }
  if (device.isNew) {
    return <div>new</div>;
  }
  return null;
};

const getMarkerClass = (device, classes) => {
  if (device.isOffline) {
    return classes.offline;
  } else if (device.isNew) {
    return classes.new;
  }
  return '';
};

const getClusterIcon = (cluster, classes) => {
  const items = cluster.getAllChildMarkers().map(marker => marker.options.item);
  return Leaflet.divIcon({
    html: renderToStaticMarkup(<DeviceClusterIcon classes={classes} devices={items} />),
    className: '',
    iconSize: Leaflet.point(44, 44)
  });
};

const EventsLayer = ({ onMapMoved }) => {
  const [bounds, setBounds] = useState();

  const debouncedBounds = useDebounce(bounds, TIMEOUTS.oneSecond);

  useEffect(() => {
    if (debouncedBounds) {
      onMapMoved(debouncedBounds);
    }
  }, [JSON.stringify(debouncedBounds)]);

  useMapEvent('moveend', ({ target }) => setBounds(target.getBounds()));
  return null;
};

const pinIcon = renderToStaticMarkup(<PinIcon style={{ transform: 'scale(3)' }} />);

const iconSize = [8, 8];
const tooltipOffset = [0, 20];

const Map = ({ items = [], mapProps = {}, onMapMoved }) => {
  const mapRef = useRef();
  const { classes } = useStyles();

  useEffect(() => {
    const { bounds } = mapProps;
    if (!bounds || !mapRef.current) {
      return;
    }
    mapRef.current.fitBounds(bounds);
  }, [JSON.stringify(mapProps.bounds)]);

  const onMapReady = map => (mapRef.current = map.target);

  return (
    <MapContainer
      className="markercluster-map"
      style={{ width: 600, height: 400 }}
      zoomControl={false}
      attributionControl={false}
      whenReady={onMapReady}
      {...mapProps}
    >
      <AttributionControl prefix="" />
      <ZoomControl position="bottomright" />
      <TileLayer {...tileLayer} />
      <MarkerClusterGroup iconCreateFunction={cluster => getClusterIcon(cluster, classes)}>
        {items.map(({ device, position }) => {
          const markerClass = getMarkerClass(device, classes);
          return (
            <Marker
              key={device.id}
              icon={Leaflet.divIcon({ className: markerClass, html: `<div title=${device.id}>${pinIcon}</div>`, iconSize })}
              item={device}
              position={position}
            >
              {!!markerClass && (
                <Tooltip className={markerClass} direction="bottom" offset={tooltipOffset} permanent>
                  <MarkerContext device={device} />
                </Tooltip>
              )}
            </Marker>
          );
        })}
        <EventsLayer onMapMoved={onMapMoved} />
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
