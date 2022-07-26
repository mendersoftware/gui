import React from 'react';

import { Autorenew, LockOutlined } from '@mui/icons-material';

import staticImage from '../../../../assets/img/static-group-creation.gif';
import dynamicImage from '../../../../assets/img/dynamic-group-creation.gif';
import InfoText from '../../common/infotext';

export const defaultStyles = {
  columns: 'two-columns',
  groupType: { flexGrow: 1, padding: 25 },
  icon: { color: '#7b7b7b' },
  image: { maxWidth: '100%' }
};

export const CreateGroupExplainerContent = ({ styles = defaultStyles, isEnterprise }) => (
  <div className="flexbox column">
    <div className={`${styles.columns} margin-bottom`} style={styles.groupType}>
      <div className="margin-right-large">
        <div className="flexbox center-aligned margin-bottom">
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
    <div
      className={`${styles.columns} ${isEnterprise ? '' : 'lightestgrey'}`}
      style={{ ...styles.groupType, padding: isEnterprise ? styles.groupType.padding : 25 }}
    >
      <div className="margin-right-large">
        <div className="flexbox center-aligned margin-bottom">
          <Autorenew fontSize="small" style={styles.icon} />
          <div className="bold margin-left-small margin-right">Dynamic group</div>
          {!isEnterprise && (
            <InfoText className="uppercased" style={{ margin: 0 }} variant="dense">
              Enterprise
            </InfoText>
          )}
        </div>
        <p className="help-content">
          You can set filters based on device attributes, and save them as a group. At any point in time, all devices that match the filters will be part of
          this group. This means that new devices will automatically join the group if they match the filters.
        </p>
        {!isEnterprise && (
          <InfoText>
            Dynamic grouping is only available to Enterprise users. <a href="mailto:contact@mender.io">Contact us</a> to ask about upgrading.
          </InfoText>
        )}
      </div>
      <img src={dynamicImage} style={styles.image} />
    </div>
  </div>
);

export default CreateGroupExplainerContent;
