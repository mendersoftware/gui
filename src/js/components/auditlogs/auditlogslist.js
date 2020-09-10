import React from 'react';
import Time from 'react-time';
import { Link } from 'react-router-dom';

import { Sort as SortIcon } from '@material-ui/icons';

import { formatTime } from '../../helpers';
import Loader from '../common/loader';
import Pagination from '../common/pagination';

export const defaultRowsPerPage = 20;

const UserChange = ({ item: { change = '-' } }) => <div className="capitalized">{change}</div>;
const DeploymentLink = ({ item }) => <Link to={`/deployments/finished?open=true&id=${item.object.id}`}>View deployment</Link>;

const changeMap = {
  user: UserChange,
  deployment: DeploymentLink
};

const ChangeDescriptor = ({ item }) => {
  const Comp = changeMap[item.object.type];
  return <Comp item={item} />;
};

const actorMap = {
  user: 'email',
  device: 'id'
};

const actionMap = {
  user: data => `User ${data.user.email}`,
  deployment: data => `Deployment to ${data.deployment['application/json'].name}`
};

const columns = [
  { title: 'User', sortable: false, propConverter: item => ({ children: item.actor[actorMap[item.actor.type]] }), component: 'div' },
  { title: 'Action', sortable: false, propConverter: item => ({ className: 'uppercased', children: item.action }), component: 'div' },
  { title: 'Changed', sortable: false, propConverter: item => ({ children: actionMap[item.object.type](item.object) }), component: 'div' },
  { title: 'More details', sortable: false, propConverter: item => ({ item }), component: ChangeDescriptor },
  { title: 'Time', sortable: true, propConverter: item => ({ value: formatTime(item.time), format: 'YYYY-MM-DD HH:mm' }), component: Time }
];

export const AuditLogsList = ({ count, items, loading, onChangePage, onChangeRowsPerPage, onChangeSorting, page, perPage, sortDirection }) => {
  return (
    !!items.length && (
      <div className="fadeIn deploy-table-contain">
        <div className="auditlogs-list-item auditlogs-list-item-header muted">
          {columns.map((item, index) => (
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
            {columns.map((header, index) => {
              const Component = header.component;
              return (
                <div key={`column-${index}`} className={header.className}>
                  <Component {...header.propConverter(item)} />
                </div>
              );
            })}
          </div>
        ))}
        {(count > items.length || items.length > defaultRowsPerPage) && (
          <Pagination count={count} rowsPerPage={perPage} onChangeRowsPerPage={onChangeRowsPerPage} page={page} onChangePage={onChangePage} />
        )}
      </div>
    )
  );
};

export default AuditLogsList;
