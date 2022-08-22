import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';

// material ui
import { Button, Checkbox, Collapse, FormControlLabel, List } from '@mui/material';
import { FileCopy as CopyPasteIcon, Info as InfoIcon } from '@mui/icons-material';

import { setSnackbar } from '../../../actions/appActions';
import { changeSamlConfig, deleteSamlConfig, getSamlConfigs, getUserOrganization, storeSamlConfig } from '../../../actions/organizationActions';
import { MenderTooltipClickable } from '../../common/mendertooltip';
import ExpandableAttribute from '../../common/expandable-attribute';
import OrganizationSettingsItem, { maxWidth } from './organizationsettingsitem';
import Billing from './billing';
import { SAMLConfig } from './samlconfig';
import { makeStyles } from 'tss-react/mui';
import { getTenantCapabilities } from '../../../selectors';
import { versionCompare } from '../../../helpers';

const useStyles = makeStyles()(theme => ({
  copyNotification: { height: 30, padding: 15 },
  ssoToggle: { width: `calc(${maxWidth}px + ${theme.spacing(4)})` },
  tenantToken: { width: `calc(${maxWidth}px - ${theme.spacing(4)})` },
  tokenTitle: { paddingRight: 10 },
  tokenExplanation: { margin: '1em 0' }
}));

export const OrgHeader = () => {
  const { classes } = useStyles();
  return (
    <div className="flexbox center-aligned">
      <div className={classes.tokenTitle}>Organization token</div>
      <MenderTooltipClickable
        disableHoverListener={false}
        placement="top"
        title={
          <>
            <h3>Organization token</h3>
            <p className={classes.tokenExplanation}>
              This token is unique for your organization and ensures that only devices that you own are able to connect to your account.
            </p>
          </>
        }
      >
        <InfoIcon />
      </MenderTooltipClickable>
    </div>
  );
};

export const Organization = ({
  canPreview,
  changeSamlConfig,
  deleteSamlConfig,
  getSamlConfigs,
  getUserOrganization,
  isEnterprise,
  isHosted,
  org,
  samlConfigs,
  setSnackbar,
  storeSamlConfig
}) => {
  const [copied, setCopied] = useState(false);
  const [hasSingleSignOn, setHasSingleSignOn] = useState(false);
  const [isResettingSSO, setIsResettingSSO] = useState(false);
  const [isConfiguringSSO, setIsConfiguringSSO] = useState(false);

  const { classes } = useStyles();

  useEffect(() => {
    getUserOrganization();
  }, []);

  useEffect(() => {
    if (isEnterprise) {
      getSamlConfigs();
    }
  }, [isEnterprise]);

  useEffect(() => {
    setHasSingleSignOn(!!samlConfigs.length);
    setIsConfiguringSSO(!!samlConfigs.length);
  }, [samlConfigs]);

  const onCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  const onSSOClick = () => {
    if (hasSingleSignOn) {
      setIsConfiguringSSO(false);
      return setIsResettingSSO(true);
    }
    setIsConfiguringSSO(current => !current);
  };

  const onCancelSSOSettings = () => {
    setIsResettingSSO(false);
    setIsConfiguringSSO(hasSingleSignOn);
  };

  const onSaveSSOSettings = useCallback(
    (id, fileContent) => {
      if (isResettingSSO) {
        return deleteSamlConfig(samlConfigs[0]).then(() => setIsResettingSSO(false));
      }
      if (id) {
        return changeSamlConfig({ id, config: fileContent });
      }
      return storeSamlConfig(fileContent);
    },
    [isResettingSSO, changeSamlConfig, deleteSamlConfig, storeSamlConfig]
  );

  return (
    <div className="margin-top-small">
      <h2 className="margin-top-small">Organization and billing</h2>
      <List>
        <OrganizationSettingsItem title="Organization name" content={{ action: { internal: true }, description: org.name }} />
        <OrganizationSettingsItem
          title={<OrgHeader />}
          content={{}}
          secondary={
            <ExpandableAttribute
              component="div"
              className={classes.tenantToken}
              disableGutters
              dividerDisabled
              key="org_token"
              secondary={org.tenant_token}
              textClasses={{ secondary: 'inventory-text tenant-token-text' }}
            />
          }
          sideBarContent={
            <div>
              <CopyToClipboard text={org.tenant_token} onCopy={onCopied}>
                <Button startIcon={<CopyPasteIcon />}>Copy to clipboard</Button>
              </CopyToClipboard>
              <div className={classes.copyNotification}>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</div>
            </div>
          }
        />
      </List>
      {(window.location.hostname.includes('staging') || canPreview) && isEnterprise && (
        <div className="flexbox center-aligned">
          <FormControlLabel
            className={`margin-bottom-small ${classes.ssoToggle}`}
            control={<Checkbox checked={!isResettingSSO && (hasSingleSignOn || isConfiguringSSO)} onChange={onSSOClick} />}
            label="Enable SAML single sign-on"
          />
          {isResettingSSO && !isConfiguringSSO && (
            <>
              <Button onClick={onCancelSSOSettings}>Cancel</Button>
              <Button onClick={onSaveSSOSettings} disabled={!hasSingleSignOn} variant="contained">
                Save
              </Button>
            </>
          )}
        </div>
      )}
      <Collapse className="margin-left-large" in={isConfiguringSSO}>
        <SAMLConfig configs={samlConfigs} onSave={onSaveSSOSettings} onCancel={onCancelSSOSettings} setSnackbar={setSnackbar} />
      </Collapse>
      {isHosted && <Billing />}
    </div>
  );
};

const actionCreators = { changeSamlConfig, deleteSamlConfig, getSamlConfigs, getUserOrganization, setSnackbar, storeSamlConfig };

const mapStateToProps = state => {
  const { isEnterprise } = getTenantCapabilities(state);
  return {
    canPreview: versionCompare(state.app.versionInformation.Integration, 'next') > -1,
    isEnterprise,
    isHosted: state.app.features.isHosted,
    org: state.organization.organization,
    samlConfigs: state.organization.samlConfigs
  };
};

export default connect(mapStateToProps, actionCreators)(Organization);
