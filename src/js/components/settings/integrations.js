import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Divider, MenuItem, Select, TextField } from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';

import { changeIntegration, createIntegration, deleteIntegration, getIntegrations } from '../../actions/organizationActions';
import { EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import Confirm from '../common/confirm';
import InfoHint from '../common/info-hint';

import azureIoT from '../../../assets/img/azure-iot-hub.png';

const InlineLaunchIcon = () => <LaunchIcon style={{ 'verticalAlign': 'text-bottom' }} fontSize="small" />;
const maxWidth = 750;

export const IntegrationConfiguration = ({ integration, onCancel, onDelete, onSave }) => {
  const { credentials = {}, provider } = integration;
  const connectionString = credentials[EXTERNAL_PROVIDER[provider].credentialsAttribute] || '';
  const [connectionConfig, setConnectionConfig] = useState(connectionString);
  const [isEditing, setIsEditing] = useState(!connectionString);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const { credentials = {}, provider } = integration;
    const connectionString = credentials[EXTERNAL_PROVIDER[provider].credentialsAttribute] || '';
    setConnectionConfig(connectionString);
    setIsEditing(!connectionString);
  }, [integration]);

  const onCancelClick = () => {
    setIsEditing(false);
    setConnectionConfig(connectionString);
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
        [EXTERNAL_PROVIDER[provider].credentialsAttribute]: connectionConfig
      }
    });

  const updateConnectionConfig = ({ target: { value = '' } }) => setConnectionConfig(value);

  const { configHint, title } = EXTERNAL_PROVIDER[provider];
  return (
    <>
      <h3 className="margin-bottom-none">{title}</h3>
      <div className="flexbox space-between relative" style={{ alignItems: 'flex-end', maxWidth }}>
        <TextField
          disabled={!isEditing}
          InputLabelProps={{ shrink: !!connectionConfig }}
          label={`${title} connection string`}
          multiline
          onChange={updateConnectionConfig}
          style={{ minWidth: 500, wordBreak: 'break-all' }}
          value={connectionConfig}
        />
        <div className="flexbox">
          {isEditing ? (
            <>
              <Button onClick={onCancelClick} style={{ marginRight: 10 }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onSaveClick} disabled={connectionString === connectionConfig}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onEditClick} style={{ marginRight: 10 }}>
                Edit
              </Button>
              <Button onClick={onDeleteClick}>Delete</Button>
            </>
          )}
        </div>
        {isDeleting && (
          <Confirm type="integrationRemoval" classes="confirmation-overlay" action={onDeleteConfirm} cancel={() => setIsDeleting(false)} style={{}} />
        )}
      </div>
      <InfoHint content={configHint} style={{ maxWidth }} />
    </>
  );
};

export const Integrations = ({ integrations = [], changeIntegration, createIntegration, deleteIntegration, getIntegrations }) => {
  const [availableIntegrations, setAvailableIntegrations] = useState([]);
  const [configuredIntegrations, setConfiguredIntegrations] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    const { available, needsUpdate } = Object.values(EXTERNAL_PROVIDER).reduce(
      (accu, provider) => {
        const hasIntegrationConfigured = integrations.some(integration => integration.provider == provider.provider);
        if (provider.enabled && !hasIntegrationConfigured) {
          accu.available.push(provider);
        }
        if (hasIntegrationConfigured && availableIntegrations.some(availableIntegration => availableIntegration.provider === provider.provider)) {
          accu.needsUpdate = true;
        }
        return accu;
      },
      { available: [], needsUpdate: !(availableIntegrations.length || integrations.length) }
    );
    if (needsUpdate) {
      setAvailableIntegrations(available);
    }
    setConfiguredIntegrations(integrations);
    setIsCreating(!!integrations.length);
  }, [integrations]);

  useEffect(() => {
    getIntegrations();
  }, []);

  const onConfigureIntegration = ({ target: { value: provider = '' } }) => {
    setCurrentValue(provider);
    setConfiguredIntegrations([{ id: 'new', provider }, ...configuredIntegrations]);
    setIsCreating(true);
  };

  const onCancelClick = ({ connectionString }) => {
    setIsCreating(!!connectionString);
    setCurrentValue('');
    setConfiguredIntegrations(integrations);
  };

  const onSaveClick = integration => {
    if (integration.id === 'new') {
      createIntegration(integration);
    } else {
      changeIntegration(integration);
    }
    setCurrentValue('');
    return setIsCreating(isCreating && !integration.connectionString ? false : isCreating);
  };

  return (
    <div style={{ minHeight: '95%', display: 'flex', flexDirection: 'column' }}>
      <div>
        <h2 className="margin-top-small">Integrations</h2>
        {!isCreating && !!availableIntegrations.length && (
          <Select displayEmpty onChange={onConfigureIntegration} value={currentValue} style={{ minWidth: 300 }}>
            <MenuItem value="">Add new integration</MenuItem>
            {availableIntegrations.map(item => (
              <MenuItem key={item.provider} value={item.provider}>
                {item.title}
              </MenuItem>
            ))}
          </Select>
        )}
        {configuredIntegrations.map(integration => (
          <IntegrationConfiguration key={integration.id} integration={integration} onCancel={onCancelClick} onDelete={deleteIntegration} onSave={onSaveClick} />
        ))}
      </div>
      <div style={{ marginTop: 'auto' }}>
        <Divider />
        <div className="margin-top-small margin-bottom-small">
          {[azureIoT].map((tile, index) => (
            <img key={`tile-${index}`} src={tile} />
          ))}
          <div className="flexbox margin-top-small" style={{ gap: '20px' }}>
            <div className="infoPanel active" style={{ dropShadow: '0' }}>
              <h4>Tutorial</h4>
              <p>
                Follow the Microsoft Azure IoT Hub{' '}
                <a href="https://hub.mender.io/t/automatic-device-provisioning-with-azure-iot-hub-using-mender/4534" target="_blank" rel="noopener noreferrer">
                  integration tutorial on Mender Hub <InlineLaunchIcon />
                </a>
              </p>
            </div>
            <div className="infoPanel active" style={{ dropShadow: '' }}>
              <h4>Video</h4>
              <p>
                <a href="https://youtu.be/pX9dhjzSX7s" target="_blank" rel="noopener noreferrer">
                  Watch a video <InlineLaunchIcon />
                </a>{' '}
                on how to connect your Mender devices to Microsoft Azure IoT Hub
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const actionCreators = { changeIntegration, createIntegration, deleteIntegration, getIntegrations };

const mapStateToProps = state => {
  return {
    integrations: state.organization.externalDeviceIntegrations
  };
};

export default connect(mapStateToProps, actionCreators)(Integrations);
