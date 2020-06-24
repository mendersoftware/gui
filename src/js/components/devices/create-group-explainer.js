import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';

import { Autorenew, LockOutlined } from '@material-ui/icons';

import staticImage from '../../../assets/img/static-group-creation.gif';
import dynamicImage from '../../../assets/img/dynamic-group-creation.gif';

import EnterpriseNotification from '../common/enterpriseNotification';

const groupTypeStyle = { flexGrow: 1, padding: 25 };

export const CreateGroupExplainer = ({ isEnterprise, onClose }) => (
  <Dialog className="dialog" disableBackdropClick disableEscapeKeyDown open={true} scroll={'paper'} fullWidth={true} maxWidth="md">
    <DialogTitle style={{ marginLeft: 15 }}>Creating a group</DialogTitle>
    <DialogContent className="flexbox column">
      <>
        <div className="two-columns margin-bottom" style={groupTypeStyle}>
          <div className="margin-right-large">
            <div className="flexbox margin-bottom" style={{ alignItems: 'center' }}>
              <LockOutlined fontSize="small" style={{ color: '#7b7b7b' }} />
              <div className="bold margin-left-small">Static group</div>
            </div>
            <p>
              Select specific devices to add them to a static group. Filter to find devices in the &apos;All devices&apos; UI, check the devices you want to
              add, and click the action button to assign them to a group.
            </p>
          </div>
          <img src={staticImage} style={{ maxWidth: '100%' }} />
        </div>
        <div className={`two-columns ${isEnterprise ? '' : 'lightestgrey'}`} style={groupTypeStyle}>
          <div className="margin-right-large">
            <div className="flexbox margin-bottom" style={{ alignItems: 'center' }}>
              <Autorenew fontSize="small" style={{ color: '#7b7b7b' }} />
              <div className="bold margin-left-small margin-right">Dynamic group</div>
              {!isEnterprise && (
                <span className="info uppercased" style={{ margin: 0 }}>
                  Enterprise
                </span>
              )}
            </div>
            <p className="help-content">
              You can set filters based on device attributes, and save them as a group. At any point in time, all devices that match the filters will be part of
              this group. This means that new devices will automatically join the group if they match the filters.
            </p>
            <EnterpriseNotification isEnterprise={isEnterprise} benefit="gain actionable insights into the devices you are updating with Mender" />
          </div>
          <img src={dynamicImage} style={{ maxWidth: '100%' }} />
        </div>
      </>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default CreateGroupExplainer;
