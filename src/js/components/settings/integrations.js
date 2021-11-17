import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, MenuItem, Select, TextField } from '@material-ui/core';

import { changeIntegration, deleteIntegration, getIntegrationFor } from '../../actions/organizationActions';
import { EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import Confirm from '../common/confirm';

const maxWidth = 750;

export const IntegrationConfiguration = ({ integration, onCancel, onDelete, onSave }) => {
  const { connectionString = '', provider } = integration;
  const [connectionConfig, setConnectionConfig] = useState(connectionString);
  const [isEditing, setIsEditing] = useState(!connectionString);
  const [isDeleting, setIsDeleting] = useState(false);

  const onCancelClick = () => {
    setIsEditing(false);
    onCancel(integration);
  };
  const onDeleteClick = () => setIsDeleting(true);
  const onDeleteConfirm = () => onDelete(integration);
  const onEditClick = () => setIsEditing(true);
  const onSaveClick = () => onSave({ ...integration, connectionString: connectionConfig });

  const updateConnectionConfig = ({ target: { value = '' } }) => setConnectionConfig(value);

  return (
    <>
      <h3 className="margin-bottom-none">{EXTERNAL_PROVIDER[provider].title}</h3>
      <div className="flexbox space-between relative" style={{ alignItems: 'flex-end', maxWidth }}>
        <TextField
          disabled={!isEditing}
          InputLabelProps={{ shrink: !!connectionConfig }}
          label={`${EXTERNAL_PROVIDER[provider].title} connection string`}
          onChange={updateConnectionConfig}
          value={connectionConfig}
          style={{ minWidth: 500 }}
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
    </>
  );
};

const emptyIntegration = {
  connectionString: '',
  provider: ''
};

export const Integrations = ({ integrations, changeIntegration, deleteIntegration, getIntegrationFor }) => {
  const [availableIntegrations, setAvailableIntegrations] = useState([]);
  const [configuredIntegrations, setConfiguredIntegrations] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    setAvailableIntegrations(
      Object.values(EXTERNAL_PROVIDER).reduce((accu, provider) => {
        if (provider.enabled && !integrations.some(integration => integration.provider == provider.provider)) {
          accu.push(provider);
        }
        return accu;
      }, [])
    );
    setConfiguredIntegrations(integrations);
  }, [integrations]);

  useEffect(() => {
    availableIntegrations.map(integration => (integration.connectionString ? undefined : getIntegrationFor(integration)));
  }, [availableIntegrations]);

  const onConfigureIntegration = ({ target: { value: provider } }) => {
    setCurrentValue(provider);
    setConfiguredIntegrations([{ ...emptyIntegration, provider }, ...configuredIntegrations]);
    setIsCreating(true);
  };

  const onCancelClick = ({ connectionString }) => {
    setIsCreating(!!connectionString);
    setCurrentValue('');
    setConfiguredIntegrations(integrations);
  };

  const onSaveClick = integration => {
    changeIntegration(integration);
    setCurrentValue('');
    return setIsCreating(isCreating && !integration.connectionString ? false : isCreating);
  };

  return (
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
        <IntegrationConfiguration
          key={integration.connectionString}
          integration={integration}
          onCancel={onCancelClick}
          onDelete={deleteIntegration}
          onSave={onSaveClick}
        />
      ))}
    </div>
  );
};

const actionCreators = { changeIntegration, deleteIntegration, getIntegrationFor };

const mapStateToProps = state => {
  return {
    integrations: state.organization.externalDeviceIntegrations ?? []
  };
};

export default connect(mapStateToProps, actionCreators)(Integrations);
