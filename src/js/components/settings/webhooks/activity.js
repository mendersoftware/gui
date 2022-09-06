import React, { useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

// material ui
import { Accordion, accordionClasses, AccordionDetails, AccordionSummary, IconButton, Tab, Tabs } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon, Circle as CircleIcon, FileCopy as CopyPasteIcon } from '@mui/icons-material';
import { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import { makeStyles } from 'tss-react/mui';

import Time from '../../common/time';
import { DEVICE_LIST_DEFAULTS } from '../../../constants/deviceConstants';
import Pagination from '../../common/pagination';

const useStyles = makeStyles()(theme => ({
  activityList: {
    display: 'flexbox',
    flexDirection: 'column',
    ['.header']: {
      padding: `0px ${theme.spacing(2)}`,
      marginBottom: theme.spacing()
    },
    [`.header, .${accordionSummaryClasses.content}`]: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr 50px'
    },
    [`.${accordionSummaryClasses.content}`]: {
      cursor: 'pointer',
      [`&>time, &>.trigger-type`]: {
        color: theme.palette.secondary.main
      },
      [`&>:last-child`]: {
        paddingRight: 'initial'
      }
    },
    [`.${accordionClasses.root}`]: {
      backgroundColor: theme.palette.background.default
    }
  },
  divider: { marginTop: theme.spacing(), marginBottom: theme.spacing() }
}));

const ContentWrapper = ({ children, raw, title }) => {
  const [copied, setCopied] = useState(false);
  const onCopied = (_, result) => {
    setCopied(result);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <>
      {title}
      <div key="content">
        <CopyToClipboard text={raw} onCopy={onCopied}>
          <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }} size="large">
            <CopyPasteIcon />
          </IconButton>
        </CopyToClipboard>
        {children}
        {copied && <p className="green fadeIn">Copied key to clipboard.</p>}
      </div>
    </>
  );
};

const Headers = ({ content }) => {
  return (
    <ContentWrapper title="Headers" raw={content.toString()}>
      <div>{content}</div>
    </ContentWrapper>
  );
};

const Payload = ({ content }) => {
  return (
    <ContentWrapper title="Payload" raw={JSON.stringify(content)}>
      <code className="pre-line">{JSON.stringify(content)}</code>
    </ContentWrapper>
  );
};

const RequestResponse = ({ content = {}, isRequest }) => {
  const { request, response } = content;
  const { headers, payload } = isRequest ? request : response;
  const sections = [
    { content: headers, component: Headers },
    { content: payload, component: Payload }
  ].reduce((accu, item) => {
    if (!item.content) {
      return accu;
    }
    const Component = item.component;
    accu.push(<Component content={item.content} />);
    return accu;
  }, []);
  return <div className="flexbox column">{sections}</div>;
};

const triggerMap = {
  'device-decommissioned': 'Device decommissioned',
  'device-provisioned': 'Device provisioned',
  'device-status-changed': 'Device status updated'
};

const iconStyles = {
  status: { fontSize: 12, marginRight: 8 },
  dropDown: { justifySelf: 'right', marginRight: 8 }
};

const DeliveryStatus = ({ entry, webhook = {} }) => {
  const { delivery_statuses = [] } = entry;

  const status = useMemo(() => {
    const status = delivery_statuses.find(status => status.integration_id === webhook.id) ?? delivery_statuses[0];
    if (status) {
      return { code: status.status_code, signal: status.success ? 'green' : 'red' };
    }
    return { code: 418, signal: 'disabled' };
  }, [JSON.stringify(delivery_statuses), webhook.id]);

  return (
    <div className="flexbox center-aligned">
      <CircleIcon className={status.signal} style={iconStyles.status} />
      <div className={status.code >= 400 ? 'muted' : ''}>{status.code}</div>
    </div>
  );
};

const columns = [
  { key: 'created_ts', title: 'Time', render: ({ entry }) => <Time value={entry.time} /> },
  { key: 'trigger', title: 'Event trigger', render: ({ entry }) => <div className="trigger-type">{triggerMap[entry.type] ?? entry.type}</div> },
  { key: 'status', title: 'Status', render: ({ entry, webhook }) => <DeliveryStatus entry={entry} webhook={webhook} /> },
  {
    key: 'details',
    title: 'Details',
    render: ({ isExpanded }) => (isExpanded ? <ArrowDropUpIcon style={iconStyles.dropDown} /> : <ArrowDropDownIcon style={iconStyles.dropDown} />)
  }
];

const tabs = ['request', 'response'];

const ListItem = ({ entry = {}, webhook }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const { data = {} } = entry;

  const hasExtendedInfo = tabs.some(tab => data.hasOwnProperty(tab));
  return (
    <Accordion square expanded={isExpanded}>
      <AccordionSummary onClick={() => setIsExpanded(current => !current)}>
        {columns.map(({ key, render: Column }) => (
          <Column key={key} entry={entry} isExpanded={isExpanded} webhook={webhook} />
        ))}
      </AccordionSummary>
      <AccordionDetails>
        {hasExtendedInfo ? (
          <>
            <Tabs value={currentTab} onChange={(e, tab) => setCurrentTab(tab)} textColor="primary">
              {tabs.map(key => (
                <Tab className="capitalized-start" key={key} label={key} value={key} />
              ))}
            </Tabs>
            <RequestResponse content={entry} isRequest={currentTab === tabs[0]} />
          </>
        ) : (
          <code>{JSON.stringify(data)}</code>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;
const WebhookActivity = ({ events = [], getWebhookEvents, webhook }) => {
  const { classes } = useStyles();
  const [page, setPage] = useState(defaultPage);
  const [perPage, setPerPage] = useState(defaultPerPage);

  useEffect(() => {
    // for now we can't offer pagination here, so show the last 50 events as a compromise
    getWebhookEvents({ page, perPage: 50 });
  }, [page, perPage]);

  return (
    <div className={classes.activityList}>
      {events.length ? (
        <>
          <div className="header">
            {columns.map(({ key, title }) => (
              <div key={key}>{title}</div>
            ))}
          </div>
          <div className="body">
            {events.map(entry => (
              <ListItem key={entry.id} entry={entry} webhook={webhook} />
            ))}
            {!!events.length && (
              <Pagination
                className="margin-top-none hidden"
                count={events.length}
                rowsPerPage={perPage}
                onChangeRowsPerPage={setPerPage}
                page={page}
                onChangePage={setPage}
              />
            )}
          </div>
        </>
      ) : (
        <div className="margin-top-large flexbox centered disabled">No webhook activity yet.</div>
      )}
    </div>
  );
};

export default WebhookActivity;
