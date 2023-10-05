// Copyright 2017 Northern.tech AS
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
import React, { useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';

// material ui
import { FileCopy as CopyPasteIcon } from '@mui/icons-material';
import { Button, Checkbox, Collapse, FormControlLabel, List } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import copy from 'copy-to-clipboard';
import moment from 'moment';

import { setSnackbar } from '../../../actions/appActions';
import {
  changeSamlConfig,
  deleteSamlConfig,
  downloadLicenseReport,
  getSamlConfigs,
  getUserOrganization,
  storeSamlConfig
} from '../../../actions/organizationActions';
import { TIMEOUTS } from '../../../constants/appConstants';
import { createFileDownload, toggle } from '../../../helpers';
import { getCurrentSession, getFeatures, getIsEnterprise, getIsPreview, getOrganization, getUserRoles } from '../../../selectors';
import ExpandableAttribute from '../../common/expandable-attribute';
import { HELPTOOLTIPS, MenderHelpTooltip } from '../../helptips/helptooltips';
import Billing from './billing';
import OrganizationSettingsItem, { maxWidth } from './organizationsettingsitem';
import { SAMLConfig } from './samlconfig';

const useStyles = makeStyles()(theme => ({
  copyNotification: { height: 30, padding: 15 },
  deviceLimitBar: { backgroundColor: theme.palette.grey[500], margin: '15px 0' },
  ssoToggle: { width: `calc(${maxWidth}px + ${theme.spacing(4)})` },
  tenantInfo: { marginTop: 11, paddingBottom: 3, 'span': { marginLeft: theme.spacing(0.5), color: theme.palette.text.disabled } },
  tenantToken: { width: `calc(${maxWidth}px - ${theme.spacing(4)})` },
  tokenTitle: { paddingRight: 10 },
  tokenExplanation: { margin: '1em 0' }
}));

export const OrgHeader = () => {
  const { classes } = useStyles();
  return (
    <div className="flexbox center-aligned">
      <div className={classes.tokenTitle}>Organization token</div>
      <MenderHelpTooltip id={HELPTOOLTIPS.tenantToken.id} disableHoverListener={false} placement="top" />
    </div>
  );
};

export const CopyTextToClipboard = ({ onCopy, token }) => {
  const [copied, setCopied] = useState(false);
  const { classes } = useStyles();

  const onCopied = () => {
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), TIMEOUTS.fiveSeconds);
  };

  return (
    <div>
      <CopyToClipboard text={token} onCopy={onCopied}>
        <Button startIcon={<CopyPasteIcon />}>Copy to clipboard</Button>
      </CopyToClipboard>
      <div className={classes.copyNotification}>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</div>
    </div>
  );
};

export const Organization = () => {
  const [hasSingleSignOn, setHasSingleSignOn] = useState(false);
  const [isResettingSSO, setIsResettingSSO] = useState(false);
  const [isConfiguringSSO, setIsConfiguringSSO] = useState(false);
  const isEnterprise = useSelector(getIsEnterprise);
  const { isAdmin } = useSelector(getUserRoles);
  const canPreview = useSelector(getIsPreview);
  const { isHosted } = useSelector(getFeatures);
  const org = useSelector(getOrganization);
  const samlConfigs = useSelector(state => state.organization.samlConfigs);
  const dispatch = useDispatch();
  const { token } = useSelector(getCurrentSession);

  const { classes } = useStyles();

  useEffect(() => {
    dispatch(getUserOrganization());
  }, [dispatch]);

  useEffect(() => {
    if (isEnterprise) {
      dispatch(getSamlConfigs());
    }
  }, [dispatch, isEnterprise]);

  useEffect(() => {
    setHasSingleSignOn(!!samlConfigs.length);
    setIsConfiguringSSO(!!samlConfigs.length);
  }, [samlConfigs.length]);

  const dispatchedSetSnackbar = useCallback((...args) => dispatch(setSnackbar(...args)), [dispatch]);

  const onSSOClick = () => {
    if (hasSingleSignOn) {
      setIsConfiguringSSO(false);
      return setIsResettingSSO(true);
    }
    setIsConfiguringSSO(toggle);
  };

  const onCancelSSOSettings = () => {
    setIsResettingSSO(false);
    setIsConfiguringSSO(hasSingleSignOn);
  };

  const onSaveSSOSettings = useCallback(
    (id, fileContent) => {
      if (isResettingSSO) {
        return dispatch(deleteSamlConfig(samlConfigs[0])).then(() => setIsResettingSSO(false));
      }
      if (id) {
        return dispatch(changeSamlConfig({ id, config: fileContent }));
      }
      return dispatch(storeSamlConfig(fileContent));
    },
    [isResettingSSO, dispatch, samlConfigs]
  );

  const onDownloadReportClick = () =>
    dispatch(downloadLicenseReport()).then(report => createFileDownload(report, `Mender-license-report-${moment().format(moment.HTML5_FMT.DATE)}`, token));

  const onTenantInfoClick = () => {
    copy(`Organization: ${org.name}, Tenant ID: ${org.id}`);
    setSnackbar('Copied to clipboard');
  };

  return (
    <div className="margin-top-small">
      <h2 className="margin-top-small">Organization and billing</h2>
      <List>
        <OrganizationSettingsItem
          title="Organization name"
          content={{
            action: { action: onTenantInfoClick, internal: true },
            description: (
              <div className={`clickable ${classes.tenantInfo}`} onClick={onTenantInfoClick}>
                {org.name}
                <span>({org.id})</span>
              </div>
            )
          }}
        />
        <OrganizationSettingsItem
          title={<OrgHeader />}
          content={{}}
          secondary={
            <ExpandableAttribute
              className={classes.tenantToken}
              component="div"
              disableGutters
              dividerDisabled
              key="org_token"
              secondary={org.tenant_token}
              textClasses={{ secondary: 'inventory-text tenant-token-text' }}
            />
          }
          sideBarContent={<CopyTextToClipboard token={org.tenant_token} />}
        />
      </List>
      {isEnterprise && isAdmin && (
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
        <SAMLConfig configs={samlConfigs} onSave={onSaveSSOSettings} onCancel={onCancelSSOSettings} setSnackbar={dispatchedSetSnackbar} token={token} />
      </Collapse>
      {isHosted && <Billing />}
      {(canPreview || !isHosted) && isEnterprise && isAdmin && (
        <Button className="margin-top" onClick={onDownloadReportClick} variant="contained">
          Download license report
        </Button>
      )}
    </div>
  );
};

export default Organization;
