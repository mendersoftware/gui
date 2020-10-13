import React, { useState } from 'react';
import Time from 'react-time';
import { Link } from 'react-router-dom';
import moment from 'moment';

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

const UserChange = ({ item: { change = '-' } }) => (
  <div className="capitalized" style={{ whiteSpace: 'pre-line' }}>
    {formatChange(change)}
  </div>
);
const DeploymentLink = ({ item }) => <Link to={`/deployments/finished?open=true&id=${item.object.id}`}>View deployment</Link>;

const changeMap = {
  user: { component: UserChange, actionFormatter: data => data.user.email },
  deployment: {
    component: DeploymentLink,
    actionFormatter: data => `to ${decodeURIComponent(data.deployment.name)}`
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

export const auditLogColumns = [
  {
    title: 'User',
    sortable: false,
    propConverter: item => ({ children: item.actor[actorMap[item.actor.type]] }),
    component: 'div',
    printFormatter: item => item.actor[actorMap[item.actor.type]]
  },
  {
    title: 'Action',
    sortable: false,
    propConverter: item => ({ className: 'uppercased', children: item.action }),
    component: 'div',
    printFormatter: item => item.action.toUpperCase()
  },
  {
    title: 'Type',
    sortable: false,
    propConverter: item => ({ className: 'capitalized', children: item.object.type }),
    component: 'div',
    printFormatter: item => item.object.type.charAt(0).toUpperCase() + item.object.type.slice(1)
  },
  {
    title: 'Change',
    sortable: false,
    propConverter: item => ({ children: changeMap[item.object.type].actionFormatter(item.object) }),
    component: 'div',
    printFormatter: item => changeMap[item.object.type].actionFormatter(item.object)
  },
  {
    title: 'More details',
    sortable: false,
    propConverter: item => ({ item }),
    component: ChangeDescriptor,
    printFormatter: ({ change = '-' }) => formatChange(change).replaceAll('\n', ' ')
  },
  {
    title: 'Time',
    sortable: true,
    propConverter: item => ({ value: formatTime(item.time), format: 'YYYY-MM-DD HH:mm' }),
    component: Time,
    printFormatter: item => moment(item.time).format('YYYY-MM-DD HH:mm')
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
              {item.change && <AccordionDetails>{expanded === item.time ? <div className="code">{item.change}</div> : <div />}</AccordionDetails>}
            </Accordion>
          ))}
        </div>
        <Pagination count={count} rowsPerPage={perPage} onChangeRowsPerPage={onChangeRowsPerPage} page={page} onChangePage={onChangePage} />
      </div>
    )
  );
};

export default AuditLogsList;
