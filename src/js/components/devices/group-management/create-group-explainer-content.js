import React from 'react';

import { Autorenew, LockOutlined } from '@mui/icons-material';

import staticImage from '../../../../assets/img/static-group-creation.gif';
import dynamicImage from '../../../../assets/img/dynamic-group-creation.gif';
import InfoText from '../../common/infotext';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  groupType: {
    flexGrow: 1,
    padding: 25,
    ['&.non-enterprise']: {
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[400]
    }
  },

  icon: { color: '#7b7b7b' },
  image: { maxWidth: '100%' }
}));

export const CreateGroupExplainerContent = ({ isEnterprise }) => {
  const { classes } = useStyles();
  return (
    <div className="flexbox column">
      <div className={`two-columns margin-bottom ${classes.groupType}`}>
        <div className="margin-right-large">
          <div className="flexbox center-aligned margin-bottom">
            <LockOutlined className={classes.icon} fontSize="small" />
            <div className="bold margin-left-small">Static group</div>
          </div>
          <p className="help-content">
            Select specific devices to add them to a static group. Filter to find devices in the &apos;All devices&apos; UI, check the devices you want to add,
            and click the action button to assign them to a group.
          </p>
        </div>
        <img className={classes.image} src={staticImage} />
      </div>
      <div className={`two-columns ${classes.groupType} ${isEnterprise ? '' : 'non-enterprise'}`}>
        <div className="margin-right-large">
          <div className="flexbox center-aligned margin-bottom">
            <Autorenew className={classes.icon} fontSize="small" />
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
        <img className={classes.image} src={dynamicImage} />
      </div>
    </div>
  );
};

export default CreateGroupExplainerContent;
