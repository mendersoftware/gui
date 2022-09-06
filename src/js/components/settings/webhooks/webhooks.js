import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Button, Chip } from '@mui/material';
import { Add as AddIcon, ArrowRightAlt as ArrowRightAltIcon } from '@mui/icons-material';

import { changeIntegration, createIntegration, deleteIntegration, getIntegrations, getWebhookEvents } from '../../../actions/organizationActions';
import { emptyWebhook } from '../../../constants/organizationConstants';
import { getDocsVersion } from '../../../selectors';
import Time from '../../common/time';
import Pagination from '../../common/pagination';
import DetailsTable from '../../common/detailstable';
import Confirm from '../../common/confirm';
import WebhookManagement from './management';
import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';

const columns = [
  { key: 'url', title: 'URL', render: ({ url }) => url },
  { key: 'status', title: 'Status', render: ({ status }) => status },
  {
    key: 'updated_ts',
    title: 'Last activity',
    render: ({ updated_ts }) => <Time value={updated_ts} />
  },
  {
    key: 'manage',
    title: 'Manage',
    render: () => (
      <div className="bold flexbox center-aligned link-color margin-right-small uppercased" style={{ whiteSpace: 'nowrap' }}>
        view details <ArrowRightAltIcon />
      </div>
    )
  }
];

export const Webhooks = ({
  changeIntegration,
  createIntegration,
  deleteIntegration,
  docsVersion,
  events,
  getIntegrations,
  getWebhookEvents,
  webhook = { ...emptyWebhook },
  webhooks
}) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(webhook);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState(false);

  useEffect(() => {
    getIntegrations();
  }, []);

  useEffect(() => {
    setSelectedWebhook(webhook);
  }, [JSON.stringify(webhook)]);

  const onAddClick = () => {
    setAdding(true);
    setEditing(false);
    setSelectedWebhook({ ...emptyWebhook });
  };

  const onEdit = item => {
    setAdding(false);
    setEditing(true);
    setSelectedWebhook(item);
  };

  const onCancel = () => {
    setAdding(false);
    setEditing(false);
  };

  const onSubmit = item => {
    if (adding) {
      createIntegration(item);
    } else {
      changeIntegration(item);
    }
    setAdding(false);
    setEditing(false);
  };

  const onRemoveClick = () => deleteIntegration(selectedWebhook);

  const onRemoveAllClick = () => {
    setIsRemoving(true);
    return Promise.all(webhooks.map(hook => deleteIntegration(hook))).finally(() => {
      setIsRemoving(false);
      setConfirmRemoval(false);
    });
  };

  const toggleConfirmRemoval = () => setConfirmRemoval(current => !current);

  const { mappedWebhooks, relevantColumns } = useMemo(() => {
    const mappedWebhooks = webhooks.map(item => ({ ...item, url: item.credentials[EXTERNAL_PROVIDER.webhook.credentialsType].url, status: 'enabled' }));
    const relevantColumns = columns.reduce((accu, item) => {
      if (mappedWebhooks.some(hook => hook[item.key]) || item === columns[columns.length - 1]) {
        accu.push(item);
      }
      return accu;
    }, []);
    return { mappedWebhooks, relevantColumns };
  }, [JSON.stringify(webhooks)]);

  return (
    <div>
      <h2>Webhooks</h2>
      {webhooks.length ? (
        <>
          <DetailsTable columns={relevantColumns} items={mappedWebhooks} onItemClick={onEdit} />
          {webhooks.length > 20 && <Pagination />}
        </>
      ) : (
        <div className="flexbox centered">
          No webhooks are configured yet. Learn more about webhooks in our{' '}
          <a href={`https://docs.mender.io/${docsVersion}server-integration`} target="_blank" rel="noopener noreferrer">
            documentation
          </a>
        </div>
      )}
      <div className="flexbox center-aligned relative hidden">
        <Chip color="primary" icon={<AddIcon />} label="Add a webhook" onClick={onAddClick} />
        <div className="margin-left-large">
          {confirmRemoval && (
            <Confirm
              action={onRemoveAllClick}
              cancel={toggleConfirmRemoval}
              classes="confirmation-overlay"
              style={{ width: 'inherit', paddingLeft: 20 }}
              type="webhooksRemoval"
            />
          )}
          <Button disabled={isRemoving} onClick={toggleConfirmRemoval}>
            delete all
          </Button>
        </div>
      </div>
      <WebhookManagement
        adding={adding}
        editing={editing}
        events={events}
        getWebhookEvents={getWebhookEvents}
        onCancel={onCancel}
        onSubmit={onSubmit}
        onRemove={onRemoveClick}
        webhook={selectedWebhook}
      />
    </div>
  );
};

const actionCreators = { changeIntegration, createIntegration, deleteIntegration, getIntegrations, getWebhookEvents };

const mapStateToProps = state => {
  const webhooks = state.organization.externalDeviceIntegrations.filter(
    integration => integration.id && integration.provider === EXTERNAL_PROVIDER.webhook.provider
  );
  const events = webhooks.length ? state.organization.webhooks.events : [];
  return {
    docsVersion: getDocsVersion(state),
    events,
    webhooks
  };
};

export default connect(mapStateToProps, actionCreators)(Webhooks);
