import React, { useState } from 'react';
import Time from 'react-time';
import { Link } from 'react-router-dom';

import { Accordion, AccordionDetails, AccordionSummary, IconButton } from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon, Sort as SortIcon } from '@material-ui/icons';

import { formatTime } from '../../helpers';
import Loader from '../common/loader';
import Pagination from '../common/pagination';

export const defaultRowsPerPage = 20;

const formatChange = change => {
  const diff = change.split(/@@.*@@/);
  return diff.length > 1 ? diff[1].trim() : diff;
};

const getDiffLineStyle = line => {
  if (line.startsWith('+ ')) {
    return 'green';
  } else if (line.startsWith('- ')) {
    return 'red';
  }
  return '';
};

const UserChange = ({ item: { change = '-' } }) => (
  <div className="capitalized" style={{ whiteSpace: 'pre-line' }}>
    {formatChange(change)}
  </div>
);

const DeploymentLink = ({ item }) => <Link to={`/deployments/finished?open=true&id=${item.object.id}`}>View deployment</Link>;

const DeviceLink = ({ item }) => <Link to={`/devices?id=${item.object.id}`}>View device</Link>;

const changeMap = {
  user: { component: UserChange, actionFormatter: data => data.user.email },
  deployment: {
    component: DeploymentLink,
    actionFormatter: data => `to ${decodeURIComponent(data.deployment.name)}`
  },
  device: {
    component: DeviceLink,
    actionFormatter: data => decodeURIComponent(data.id)
  }
};

const ChangeDescriptor = ({ item }) => {
  const Comp = changeMap[item.object.type].component;
  return <Comp item={item} />;
};

const actorMap = {
  user: 'email',
  device: 'id'
};

const auditLogColumns = [
  {
    title: 'User',
    sortable: false,
    propConverter: item => ({ children: item.actor[actorMap[item.actor.type]] }),
    component: 'div'
  },
  {
    title: 'Action',
    sortable: false,
    propConverter: item => ({ className: 'uppercased', children: item.action }),
    component: 'div'
  },
  {
    title: 'Type',
    sortable: false,
    propConverter: item => ({ className: 'capitalized', children: item.object.type }),
    component: 'div'
  },
  {
    title: 'Change',
    sortable: false,
    propConverter: item => ({ children: changeMap[item.object.type].actionFormatter(item.object) }),
    component: 'div'
  },
  {
    title: 'More details',
    sortable: false,
    propConverter: item => ({ item }),
    component: ChangeDescriptor
  },
  {
    title: 'Time',
    sortable: true,
    propConverter: item => ({ value: formatTime(item.time), format: 'YYYY-MM-DD HH:mm' }),
    component: Time
  }
];

export const AuditLogsList = ({ count, items, loading, onChangePage, onChangeRowsPerPage, onChangeSorting, page, perPage, sortDirection }) => {
  const [expanded, setExpanded] = useState();

  const onExpand = item => {
    setExpanded(item.time === expanded ? null : item.time);
  };

  return (
    !!items.length && (
      <div className="fadeIn deploy-table-contain auditlogs-list">
        <div className="auditlogs-list-item auditlogs-list-item-header muted">
          {auditLogColumns.map((item, index) => (
            <div
              className="columnHeader"
              key={`columnHeader-${index}`}
              onClick={() => (item.sortable ? onChangeSorting() : null)}
              style={item.sortable ? {} : { cursor: 'initial' }}
            >
              {item.title}
              {item.sortable ? <SortIcon className={`sortIcon selected ${(sortDirection === 'desc').toString()}`} /> : null}
            </div>
          ))}
          <div />
        </div>
        <Loader show={loading} />
        <div className="auditlogs-list">
          {items.map(item => (
            <Accordion className="auditlogs-list-item" key={`event-${item.time}`} square expanded={expanded === item.time} onChange={() => onExpand(item)}>
              <AccordionSummary style={{ padding: 0 }}>
                {auditLogColumns.map((header, index) => {
                  const Component = header.component;
                  return (
                    <div key={`column-${index}`} className={header.className}>
                      <Component {...header.propConverter(item)} />
                    </div>
                  );
                })}
                {item.change ? (
                  <IconButton className="expandButton">{expanded === item.time ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</IconButton>
                ) : (
                  <div />
                )}
              </AccordionSummary>
              {item.change && (
                <AccordionDetails>
                  <div className="code flexbox column">
                    {item.change.split('\n').map((line, index) => (
                      <span key={`line-${index}`} className={getDiffLineStyle(line)}>
                        {line}
                      </span>
                    ))}
                  </div>
                </AccordionDetails>
              )}
            </Accordion>
          ))}
        </div>
        <Pagination count={count} rowsPerPage={perPage} onChangeRowsPerPage={onChangeRowsPerPage} page={page} onChangePage={onChangePage} />
      </div>
    )
  );
};

export default AuditLogsList;
