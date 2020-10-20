import React from 'react';

import copy from 'copy-to-clipboard';

import { Button, List } from '@material-ui/core';
import { Link as LinkIcon, Replay as ReplayIcon } from '@material-ui/icons';

import ExpandableAttribute from '../../common/expandable-attribute';
import ForwardingLink from '../../common/forwardlink';
import { inlineHeadingStyle } from '../../artifacts/artifactPayload';

const softwareAttributeNames = ['rootfs-image', 'data-partition', 'artifact_name'];
const listItemTextClass = { secondary: 'inventory-text' };

export const DeviceInventory = ({ attributes, id, setSnackbar, unauthorized }) => {
  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/devices') + '/devices'.length);
    copy(`${location}?id=${id}`);
    setSnackbar('Link copied to clipboard');
  };

  const { softwareAttributes, deviceInventory } = Object.entries(attributes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (accu, attribute, i) => {
        const softwareAttribute = softwareAttributeNames.find(item => attribute[0].startsWith(item));
        if (softwareAttribute) {
          if (!accu.softwareAttributes[softwareAttribute]) {
            accu.softwareAttributes[softwareAttribute] = [];
          }
          accu.softwareAttributes[softwareAttribute].push({ key: attribute[0], value: attribute[1] });
        } else {
          const secondaryText = Array.isArray(attribute[1]) ? attribute[1].join(',') : attribute[1];
          accu.deviceInventory.push(<ExpandableAttribute key={`info-${i}`} primary={attribute[0]} secondary={secondaryText} textClasses={listItemTextClass} />);
        }
        return accu;
      },
      { softwareAttributes: {}, deviceInventory: [] }
    );

  const mapLayerInformation = (layerInfo, i) => {
    let primary = layerInfo.key;
    let secondary = layerInfo.value;
    let priority = i + 2;
    const infoItems = layerInfo.key.split('.');
    switch (infoItems.length) {
      case 2:
        primary = layerInfo.key === 'rootfs-image.version' ? 'System software version' : primary;
        priority = i;
        break;
      case 3:
        primary = infoItems[1];
        break;
      default:
        break;
    }
    const component = <ExpandableAttribute key={`software-info-${i}`} primary={primary} secondary={secondary} textClasses={listItemTextClass} />;
    return { priority, component };
  };

  const layers = Object.entries(softwareAttributes).map(layer => {
    const items = layer[1]
      .map(mapLayerInformation)
      .sort((a, b) => a.priority.localeCompare(b.priority))
      .map(item => item.component);
    return { title: layer[0], items };
  });

  return (
    <>
      <div className={`device-inventory bordered ${unauthorized ? 'hidden' : 'report-list'}`}>
        <h4>Device inventory</h4>
        <div className="file-details">
          <h4 style={inlineHeadingStyle}>Installed software</h4>
          {layers.map((layer, layerIndex) => (
            <div className="flexbox column" key={`layer-${layerIndex}`}>
              <div className="margin-top-small">{layer.title}</div>
              <List>{layer.items}</List>
            </div>
          ))}
        </div>
        <List>{deviceInventory}</List>
      </div>
      <div className="device-actions" style={{ marginTop: '24px' }}>
        <Button onClick={copyLinkToClipboard} startIcon={<LinkIcon />}>
          Copy link to this device
        </Button>
        <span className="margin-left">
          <Button to={`/deployments?open=true&deviceId=${id}`} component={ForwardingLink} startIcon={<ReplayIcon />}>
            Create a deployment for this device
          </Button>
        </span>
      </div>
    </>
  );
};

export default DeviceInventory;
