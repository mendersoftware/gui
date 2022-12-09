import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { ArrowRightAlt as ArrowRightAltIcon } from '@mui/icons-material';

import { changeIntegration, createIntegration, deleteIntegration, getIntegrations, getWebhookEvents } from '../../../actions/organizationActions';
import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';
import { emptyWebhook } from '../../../constants/organizationConstants';
import { getDocsVersion } from '../../../selectors';
import DetailsTable from '../../common/detailstable';
import Time from '../../common/time';
import WebhookManagement from './management';

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
  eventTotal,
  getIntegrations,
  getWebhookEvents,
  webhook = { ...emptyWebhook },
  webhooks
}) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(webhook);

  useEffect(() => {
    getIntegrations();
  }, []);

  useEffect(() => {
    setSelectedWebhook(webhook);
  }, [JSON.stringify(webhook)]);

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
        <DetailsTable columns={relevantColumns} items={mappedWebhooks} onItemClick={onEdit} />
      ) : (
        <div className="flexbox centered">
          No webhooks are configured yet. Learn more about webhooks in our{' '}
          <a href={`https://docs.mender.io/${docsVersion}server-integration`} target="_blank" rel="noopener noreferrer">
            documentation
          </a>
        </div>
      )}
      <WebhookManagement
        adding={adding}
        editing={editing}
        events={events}
        eventTotal={eventTotal}
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
    eventTotal: state.organization.webhooks.eventTotal,
    webhooks
  };
};

export default connect(mapStateToProps, actionCreators)(Webhooks);
