import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';

import { Autorenew, LockOutlined } from '@material-ui/icons';

import staticImage from '../../../assets/img/static-group-creation.gif';
import dynamicImage from '../../../assets/img/dynamic-group-creation.gif';

const styles = {
  groupType: { flexGrow: 1, padding: 25 },
  heading: { alignItems: 'center' },
  icon: { color: '#7b7b7b' },
  image: { maxWidth: '100%' }
};

export const CreateGroupExplainer = ({ isEnterprise, onClose }) => (
  <Dialog className="dialog" disableBackdropClick disableEscapeKeyDown open={true} scroll={'paper'} fullWidth={true} maxWidth="md">
    <DialogTitle style={{ marginLeft: 15 }}>Creating a group</DialogTitle>
    <DialogContent className="flexbox column">
      <div className="two-columns margin-bottom" style={styles.groupType}>
        <div className="margin-right-large">
          <div className="flexbox margin-bottom" style={styles.heading}>
            <LockOutlined fontSize="small" style={styles.icon} />
            <div className="bold margin-left-small">Static group</div>
          </div>
          <p className="help-content">
            Select specific devices to add them to a static group. Filter to find devices in the &apos;All devices&apos; UI, check the devices you want to add,
            and click the action button to assign them to a group.
          </p>
        </div>
        <img src={staticImage} style={styles.image} />
      </div>
      <div className={`two-columns ${isEnterprise ? '' : 'lightestgrey'}`} style={styles.groupType}>
        <div className="margin-right-large">
          <div className="flexbox margin-bottom" style={styles.heading}>
            <Autorenew fontSize="small" style={styles.icon} />
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
          <p className="info">
            Dynamic grouping is only available to Enterprise users. <a href="mailto:contact@mender.io">Contact us</a> to ask about upgrading.
          </p>
        </div>
        <img src={dynamicImage} style={styles.image} />
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default CreateGroupExplainer;
