import React from 'react';

import copy from 'copy-to-clipboard';

import { Button, List } from '@material-ui/core';
import { Link as LinkIcon, Replay as ReplayIcon } from '@material-ui/icons';

import { extractSoftware, extractSoftwareInformation } from '../../../helpers';
import ExpandableAttribute from '../../common/expandable-attribute';
import ForwardingLink from '../../common/forwardlink';
import { inlineHeadingStyle } from '../../artifacts/artifactPayload';

const listItemTextClass = { secondary: 'inventory-text' };

const softwareTitleMap = {
  'rootfs-image.version': { title: 'System software version', priority: 0 },
  'rootfs-image.checksum': { title: 'checksum', priority: 1 }
};

export const DeviceInventory = ({ attributes, id, setSnackbar, unauthorized }) => {
  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/devices') + '/devices'.length);
    copy(`${location}?id=${id}`);
    setSnackbar('Link copied to clipboard');
  };

  const softwareInfo = extractSoftware(attributes);
  const deviceInventory = Object.entries(attributes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((accu, attribute, i) => {
      const softwareAttribute = softwareInfo.find(info => attribute[0].startsWith(info));
      if (!softwareAttribute) {
        const secondaryText = Array.isArray(attribute[1]) ? attribute[1].join(',') : attribute[1];
        accu.push(<ExpandableAttribute key={`info-${i}`} primary={attribute[0]} secondary={secondaryText} textClasses={listItemTextClass} />);
      }
      return accu;
    }, []);

  const softwareInformation = Object.entries(extractSoftwareInformation(attributes, softwareTitleMap)).map(item => ({
    title: item[0],
    content: item[1].map((info, index) => (
      <ExpandableAttribute key={`${item[0]}-info-${index}`} primary={info.primary} secondary={info.secondary} textClasses={listItemTextClass} />
    ))
  }));

  return (
    <>
      <div className={`device-inventory bordered ${unauthorized ? 'hidden' : 'report-list'}`}>
        <h4>Device inventory</h4>
        <div className="file-details">
          <h4 style={inlineHeadingStyle}>Installed software</h4>
          {softwareInformation.map((layer, layerIndex) => (
            <div className="flexbox column" key={`layer-${layerIndex}`}>
              <div className="margin-top-small">{layer.title}</div>
              <List>{layer.content}</List>
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
