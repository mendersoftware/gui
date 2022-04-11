import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';

import preauthImage from '../../../assets/img/preauthorize.png';

import Time, { RelativeTime } from '../common/time';
import DeviceStatus from './device-status';

const propertyNameMap = {
  inventory: 'attributes',
  identity: 'identity_data',
  system: 'system',
  monitor: 'monitor',
  tags: 'tags'
};

export const defaultTextRender = ({ column, device }) => {
  const propertyName = propertyNameMap[column.attribute.scope] ?? column.attribute.scope;
  const accessorTarget = device[propertyName] ?? device;
  const attributeValue = accessorTarget[column.attribute.name] || accessorTarget[column.attribute.alternative] || device[column.attribute.name];
  return typeof attributeValue === 'object' ? JSON.stringify(attributeValue) : attributeValue;
};

export const getDeviceIdentityText = ({ device = {}, idAttribute }) => {
  const { id, identity_data = {} } = device;
  // eslint-disable-next-line no-unused-vars
  const { status, ...remainingIds } = identity_data;
  const nonIdKey = Object.keys(remainingIds)[0];
  return !idAttribute || idAttribute === 'id' || idAttribute === 'Device ID' ? id : identity_data[idAttribute] ?? identity_data[nonIdKey];
};

const AttributeRenderer = ({ content, textContent }) => (
  <div title={textContent}>
    <div className="text-overflow">{content}</div>
  </div>
);

export const DefaultAttributeRenderer = ({ column, device, idAttribute }) => (
  <AttributeRenderer content={column.textRender({ device, column, idAttribute })} textContent={column.textRender({ device, column, idAttribute })} />
);

export const getDeviceSoftwareText = (attributes = {}) => attributes['rootfs-image.version'] || attributes.artifact_name || '-';
export const DeviceSoftware = ({ device }) => (
  <AttributeRenderer content={getDeviceSoftwareText(device.attributes)} textContent={getDeviceSoftwareText(device.attributes)} />
);

export const getDeviceTypeText = (attributes = {}) => (attributes.device_type?.length ? attributes.device_type.join(',') : '-');
export const DeviceTypes = ({ device }) => (
  <AttributeRenderer content={getDeviceTypeText(device.attributes)} textContent={getDeviceTypeText(device.attributes)} />
);

export const RelativeDeviceTime = ({ device }) => (
  <div>
    <RelativeTime updateTime={device.updated_ts} />
  </div>
);
export const DeviceCreationTime = ({ device }) => (device.created_ts ? <Time value={device.created_ts} /> : '-');

export const DeviceStatusRenderer = ({ device }) => (
  <div>
    <DeviceStatus device={device} />
  </div>
);

export const AcceptedEmptyState = ({ allCount }) => (
  <div className="dashboard-placeholder">
    <p>No devices found</p>
    {!allCount && (
      <>
        <p>No devices have been authorized to connect to the Mender server yet.</p>
        <p>
          Visit the <Link to="/help/get-started">Help section</Link> to learn how to connect devices to the Mender server.
        </p>
      </>
    )}
  </div>
);

export const PreauthorizedEmptyState = ({ canManageDevices, limitMaxed, onClick }) => (
  <div className="dashboard-placeholder">
    <p>There are no preauthorized devices.</p>
    {canManageDevices && (
      <p>
        {limitMaxed ? 'Preauthorize devices' : <a onClick={onClick}>Preauthorize devices</a>} so that when they come online, they will connect to the server
        immediately
      </p>
    )}
    <img src={preauthImage} alt="preauthorize" />
  </div>
);

export const PendingEmptyState = ({ filters, highlightHelp }) => (
  <div className="dashboard-placeholder">
    <p>
      {filters.length
        ? `There are no pending devices matching the selected ${pluralize('filters', filters.length)}`
        : 'There are no devices pending authorization'}
    </p>
    {highlightHelp ? (
      <p>
        Visit the <Link to="/help/get-started">Help section</Link> to learn how to connect devices to the Mender server.
      </p>
    ) : null}
  </div>
);

export const RejectedEmptyState = ({ filters }) => (
  <div className="dashboard-placeholder">
    <p>{filters.length ? `There are no rejected devices matching the selected ${pluralize('filters', filters.length)}` : 'There are no rejected devices'}</p>
  </div>
);
