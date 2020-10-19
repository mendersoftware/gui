import React from 'react';

import copy from 'copy-to-clipboard';

import { Button, List } from '@material-ui/core';
import { Link as LinkIcon, Replay as ReplayIcon } from '@material-ui/icons';

import ExpandableAttribute from '../../common/expandable-attribute';
import ForwardingLink from '../../common/forwardlink';

export const DeviceInventory = ({ attributes, id, setSnackbar, unauthorized }) => {
  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/devices') + '/devices'.length);
    copy(`${location}?id=${id}`);
    setSnackbar('Link copied to clipboard');
  };

  const sortedAttributes = Object.entries(attributes).sort((a, b) => a[0].localeCompare(b[0]));
  const deviceInventory = sortedAttributes.reduce((accu, attribute, i) => {
    var secondaryText = Array.isArray(attribute[1]) ? attribute[1].join(',') : attribute[1];
    accu.push(<ExpandableAttribute key={i} primary={attribute[0]} secondary={secondaryText} textClasses={{ secondary: 'inventory-text' }} />);
    return accu;
  }, []);
  const layers = [];
  return (
    <>
      <div className={`device-inventory bordered ${unauthorized ? 'hidden' : 'report-list'}`}>
        <h4 className="margin-bottom-none">Device inventory</h4>
        <div className="file-details">
          <h4>Installed software</h4>
          {layers.map((layer, layerIndex) => (
            <div key={`layer-${layerIndex}`}>
              <h5>layer.title</h5>
              <List>
                {layer.info.map((info, index) => (
                  <ExpandableAttribute key={`info-${index}`} primary={info.title} secondary={info.value} />
                ))}
              </List>
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
