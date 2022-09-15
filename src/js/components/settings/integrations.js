import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Divider, MenuItem, Select, TextField } from '@mui/material';

import { changeIntegration, createIntegration, deleteIntegration, getIntegrations } from '../../actions/organizationActions';
import { EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import Confirm from '../common/confirm';
import InfoHint from '../common/info-hint';
import { useDebounce } from '../../utils/debouncehook';
import { makeStyles } from 'tss-react/mui';
import { customSort, versionCompare } from '../../helpers';
import { WebhookCreation } from './webhooks/configuration';
import Webhooks from './webhooks/webhooks';

const maxWidth = 750;

const useStyles = makeStyles()(theme => ({
  leftButton: { marginRight: theme.spacing() },
  inputWrapper: { alignItems: 'flex-end' },
  select: { marginTop: theme.spacing(2), minWidth: 300 },
  textInput: { margin: theme.spacing(), minWidth: 500, wordBreak: 'break-all' },
  widthLimit: { maxWidth }
}));

const ConnectionDetailsInput = ({ connectionConfig, isEditing, setConnectionConfig }) => {
  const { access_key_id = '', secret_access_key = '', region = '', device_policy_name = '' } = connectionConfig.aws || {};
  const [keyId, setKeyId] = useState(access_key_id);
  const [keySecret, setKeySecret] = useState(secret_access_key);
  const [awsRegion, setRegion] = useState(region);
  const [policy, setPolicy] = useState(device_policy_name);

  const debouncedId = useDebounce(keyId, 700);
  const debouncedSecret = useDebounce(keySecret, 700);
  const debouncedRegion = useDebounce(awsRegion, 700);
  const debounced = useDebounce(policy, 700);

  const { classes } = useStyles();

  useEffect(() => {
    setConnectionConfig({
      aws: {
        access_key_id: debouncedId,
        secret_access_key: debouncedSecret,
        region: debouncedRegion,
        device_policy_name: debounced
      }
    });
  }, [debounced, debouncedRegion, debouncedId, debouncedSecret]);

  useEffect(() => {
    setKeyId(access_key_id);
    setKeySecret(secret_access_key);
    setRegion(region);
    setPolicy(device_policy_name);
  }, [access_key_id, secret_access_key, region, device_policy_name]);

  const onKeyChange = ({ target: { value = '' } }) => setKeyId(value);
  const onSecretChange = ({ target: { value = '' } }) => setKeySecret(value);
  const onRegionChange = ({ target: { value = '' } }) => setRegion(value);
  const onPolicyChange = ({ target: { value = '' } }) => setPolicy(value);

  const commonProps = { className: classes.textInput, disabled: !isEditing, multiline: true };
  return (
    <div className="flexbox column">
      <TextField {...commonProps} label="Key ID" onChange={onKeyChange} value={keyId} />
      <TextField {...commonProps} label="Key Secret" onChange={onSecretChange} value={keySecret} />
      <TextField {...commonProps} label="Region" onChange={onRegionChange} value={awsRegion} />
      <TextField {...commonProps} label="Device Policy Name" onChange={onPolicyChange} value={policy} />
    </div>
  );
};

const ConnectionStringInput = ({ connectionConfig, isEditing, setConnectionConfig, title }) => {
  const [value, setValue] = useState(connectionConfig.connection_string);
  const debouncedValue = useDebounce(value, 700);

  const { classes } = useStyles();

  useEffect(() => {
    setConnectionConfig({ connection_string: debouncedValue });
  }, [debouncedValue]);

  useEffect(() => {
    setValue(connectionConfig.connection_string);
  }, [connectionConfig.connection_string]);

  const updateConnectionConfig = ({ target: { value = '' } }) => setValue(value);

  return (
    <TextField
      className={classes.textInput}
      disabled={!isEditing}
      label={`${title} connection string`}
      multiline
      onChange={updateConnectionConfig}
      value={value}
    />
  );
};

const providerConfigMap = {
  'iot-core': ConnectionDetailsInput,
  'iot-hub': ConnectionStringInput
};

export const IntegrationConfiguration = ({ integration, isLast, onCancel, onDelete, onSave }) => {
  const { credentials = {}, provider } = integration;
  const [connectionConfig, setConnectionConfig] = useState(credentials);
  // eslint-disable-next-line no-unused-vars
  const { type, ...otherProps } = credentials;
  const [isEditing, setIsEditing] = useState(!Object.values(otherProps).some(i => i));
  const [isDeleting, setIsDeleting] = useState(false);

  const { classes } = useStyles();

  useEffect(() => {
    const { credentials = {} } = integration;
    // eslint-disable-next-line no-unused-vars
    const { type, ...otherProps } = credentials;
    setConnectionConfig(credentials);
    setIsEditing(!Object.values(otherProps).some(i => i));
  }, [integration]);

  const onCancelClick = () => {
    setIsEditing(false);
    setConnectionConfig(credentials);
    onCancel(integration);
  };
  const onDeleteClick = () => setIsDeleting(true);
  const onDeleteConfirm = () => onDelete(integration);
  const onEditClick = () => setIsEditing(true);
  const onSaveClick = () =>
    onSave({
      ...integration,
      credentials: {
        type: EXTERNAL_PROVIDER[provider].credentialsType,
        ...connectionConfig
      }
    });

  const ConfigInput = providerConfigMap[provider];
  const { configHint, title } = EXTERNAL_PROVIDER[provider];
  return (
    <>
      <h3 className="margin-bottom-none">{title}</h3>
      <div className={`flexbox space-between relative ${classes.widthLimit} ${classes.inputWrapper}`}>
        <ConfigInput connectionConfig={connectionConfig} isEditing={isEditing} setConnectionConfig={setConnectionConfig} title={title} />
        <div className="flexbox">
          {isEditing ? (
            <>
              <Button className={classes.leftButton} onClick={onCancelClick}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onSaveClick} disabled={credentials === connectionConfig}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button className={classes.leftButton} onClick={onEditClick}>
                Edit
              </Button>
              <Button onClick={onDeleteClick}>Delete</Button>
            </>
          )}
        </div>
        {isDeleting && <Confirm type="integrationRemoval" classes="confirmation-overlay" action={onDeleteConfirm} cancel={() => setIsDeleting(false)} />}
      </div>
      <InfoHint className={`margin-bottom ${classes.widthLimit}`} content={configHint} />
      {!isLast && <Divider className={`margin-bottom ${classes.widthLimit}`} />}
    </>
  );
};

const determineAvailableIntegrations = (integrations, isPreRelease) =>
  Object.values(EXTERNAL_PROVIDER).reduce((accu, provider) => {
    const hasIntegrationConfigured = integrations.some(integration => integration.provider == provider.provider);
    if (provider.title && (provider.enabled || isPreRelease) && !hasIntegrationConfigured) {
      accu.push(provider);
    }
    return accu;
  }, []);

export const Integrations = ({ changeIntegration, createIntegration, deleteIntegration, getIntegrations, integrations = [], isPreRelease }) => {
  const [availableIntegrations, setAvailableIntegrations] = useState([]);
  const [configuredIntegrations, setConfiguredIntegrations] = useState([]);
  const [isConfiguringWebhook, setIsConfiguringWebhook] = useState(false);

  const { classes } = useStyles();

  useEffect(() => {
    const available = determineAvailableIntegrations(integrations, isPreRelease);
    setAvailableIntegrations(integrations.length ? [] : available);
    setConfiguredIntegrations(integrations.filter(integration => integration.provider !== EXTERNAL_PROVIDER.webhook.provider));
  }, [integrations, isPreRelease]);

  useEffect(() => {
    getIntegrations();
  }, []);

  const onConfigureIntegration = ({ target: { value: provider = '' } }) => {
    if (provider === EXTERNAL_PROVIDER.webhook.provider) {
      return setIsConfiguringWebhook(true);
    }
    setConfiguredIntegrations([...configuredIntegrations, { id: 'new', provider }]);
    setAvailableIntegrations(integrations => integrations.filter(integration => integration.provider !== provider));
  };

  const onCancelClick = ({ id, provider }) => {
    if (id === 'new') {
      setAvailableIntegrations(current => [...current, EXTERNAL_PROVIDER[provider]].sort(customSort(true, 'provider')));
      setConfiguredIntegrations(current =>
        current.filter(
          integration => !(integration.id === id && integration.provider === provider && integration.provider !== EXTERNAL_PROVIDER.webhook.provider)
        )
      );
    }
    setIsConfiguringWebhook(false);
  };

  const onSaveClick = integration => {
    if (integration.id === 'new') {
      setIsConfiguringWebhook(false);
      return createIntegration(integration);
    }
    changeIntegration(integration);
  };

  const configuredWebhook = useMemo(() => integrations.find(integration => integration.provider === EXTERNAL_PROVIDER.webhook.provider), [integrations]);
  return (
    <div>
      <h2 className="margin-top-small">Integrations</h2>
      {configuredIntegrations.map((integration, index) => (
        <IntegrationConfiguration
          key={integration.provider}
          integration={integration}
          isLast={configuredIntegrations.length === index + 1}
          onCancel={onCancelClick}
          onDelete={deleteIntegration}
          onSave={onSaveClick}
        />
      ))}
      {!configuredWebhook && !!availableIntegrations.length && (
        <Select className={classes.select} displayEmpty onChange={onConfigureIntegration} value="">
          <MenuItem value="">Add new integration</MenuItem>
          {availableIntegrations.map(item => (
            <MenuItem key={item.provider} value={item.provider}>
              {item.title}
            </MenuItem>
          ))}
          <MenuItem value="webhook">Webhooks</MenuItem>
        </Select>
      )}
      {!!configuredWebhook && <Webhooks webhook={configuredWebhook} />}
      <WebhookCreation adding={isConfiguringWebhook} onCancel={onCancelClick} onSubmit={onSaveClick} />
    </div>
  );
};

const actionCreators = { changeIntegration, createIntegration, deleteIntegration, getIntegrations };

const mapStateToProps = state => {
  return {
    integrations: state.organization.externalDeviceIntegrations,
    isPreRelease: versionCompare(state.app.versionInformation.Integration, 'next') > -1
  };
};

export default connect(mapStateToProps, actionCreators)(Integrations);
