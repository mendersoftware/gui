import React from 'react';
import Time from 'react-time';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { Sort as SortIcon } from '@material-ui/icons';

import { formatTime } from '../../helpers';
import Loader from '../common/loader';
import Pagination from '../common/pagination';

export const defaultRowsPerPage = 20;

const UserChange = ({ item: { change = '-' } }) => <div className="capitalized">{change}</div>;
const DeploymentLink = ({ item }) => <Link to={`/deployments/finished?open=true&id=${item.object.id}`}>View deployment</Link>;

const ChangeDescriptor = ({ item }) => {
  const Comp = changeMap[item.object.type].component;
  return <Comp item={item} />;
};

const actorMap = {
  user: 'email',
  device: 'id'
};

const changeMap = {
  user: { component: UserChange, actionFormatter: data => data.user.email },
  deployment: { component: DeploymentLink, actionFormatter: data => `to ${data.deployment['application/json'].name}` }
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
    printFormatter: ({ change = '-' }) => change
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
  return (
    !!items.length && (
      <div className="fadeIn deploy-table-contain">
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
        </div>
        <Loader show={loading} />
        {items.map(item => (
          <div className="auditlogs-list-item" key={`event-${item.time}`}>
            {auditLogColumns.map((header, index) => {
              const Component = header.component;
              return (
                <div key={`column-${index}`} className={header.className}>
                  <Component {...header.propConverter(item)} />
                </div>
              );
            })}
          </div>
        ))}
        <Pagination count={count} rowsPerPage={perPage} onChangeRowsPerPage={onChangeRowsPerPage} page={page} onChangePage={onChangePage} />
      </div>
    )
  );
};

export default AuditLogsList;
