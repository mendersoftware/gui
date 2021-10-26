import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ArrowRightAlt as ArrowRightAltIcon, Sort as SortIcon } from '@material-ui/icons';

import Loader from '../common/loader';
import Pagination from '../common/pagination';
import EventDetailsDrawer from './eventdetailsdrawer';
import { SORTING_OPTIONS } from '../../constants/appConstants';
import LocaleTime from '../common/localetime';

export const defaultRowsPerPage = 20;

const ArtifactLink = ({ item }) => <Link to={`/releases/${item.object.artifact.name}`}>View artifact</Link>;
const DeploymentLink = ({ item }) => <Link to={`/deployments/finished?open=true&id=${item.object.id}`}>View deployment</Link>;
const DeviceLink = ({ item }) => <Link to={`/devices?id=${item.object.id}`}>View device</Link>;
const TerminalSessionLink = () => <a>View session log</a>;
const UserChange = ({ item: { change = '-' } }) => {
  const formatChange = change => {
    const diff = change.split(/@@.*@@/);
    return diff.length > 1 ? diff[1].trim() : diff;
  };
  return (
    <div className="capitalized" style={{ alignItems: 'flex-start', whiteSpace: 'pre-line' }}>
      {formatChange(change)}
    </div>
  );
};

const fallbackFormatter = data => {
  let result = '';
  try {
    result = JSON.stringify(data);
  } catch (error) {
    console.log(error);
  }
  return result;
};

const changeMap = {
  default: { component: 'div', actionFormatter: fallbackFormatter, title: 'defaultTitle' },
  artifact: { actionFormatter: data => `uploaded ${decodeURIComponent(data.artifact.name)}`, component: ArtifactLink },
  deployment: { actionFormatter: data => `to ${decodeURIComponent(data.deployment.name)}`, component: DeploymentLink },
  user: { component: UserChange, actionFormatter: data => data.user.email }
};

const mapChangeToContent = item => {
  let content = changeMap[item.object.type];
  if (content) {
    return content;
  } else if (item.object.type === 'device' && item.action.includes('terminal')) {
    content = { actionFormatter: data => decodeURIComponent(data.id), component: TerminalSessionLink };
  } else if (item.object.type === 'device') {
    content = { actionFormatter: data => decodeURIComponent(data.id), component: DeviceLink };
  } else {
    content = changeMap.default;
  }
  return content;
};

const actorMap = {
  user: 'email',
  device: 'id'
};

const UserDescriptor = (item, index) => <div key={`${item.time}-${index}`}>{item.actor[actorMap[item.actor.type]]}</div>;
const ActionDescriptor = (item, index) => (
  <div className="uppercased" key={`${item.time}-${index}`}>
    {item.action}
  </div>
);
const TypeDescriptor = (item, index) => (
  <div className="capitalized" key={`${item.time}-${index}`}>
    {item.object.type}
  </div>
);
const ChangeDescriptor = (item, index) => <div key={`${item.time}-${index}`}>{mapChangeToContent(item).actionFormatter(item.object)}</div>;
const ChangeDetailsDescriptor = (item, index) => {
  const Comp = mapChangeToContent(item).component;
  return <Comp key={`${item.time}-${index}`} item={item} />;
};
const TimeWrapper = (item, index) => <LocaleTime key={`${item.time}-${index}`} value={item.time} />;

const auditLogColumns = [
  { title: 'User', sortable: false, render: UserDescriptor },
  { title: 'Action', sortable: false, render: ActionDescriptor },
  { title: 'Type', sortable: false, render: TypeDescriptor },
  { title: 'Changed', sortable: false, render: ChangeDescriptor },
  { title: 'More details', sortable: false, render: ChangeDetailsDescriptor },
  { title: 'Time', sortable: true, render: TimeWrapper }
];

export const AuditLogsList = ({ items, loading, locationChange, onChangePage, onChangeRowsPerPage, onChangeSorting, selectionState, setAuditlogsState }) => {
  const { page, perPage, selectedIssue: selectedItem, sorting: sortDirection, total: count } = selectionState;

  useEffect(() => {
    setAuditlogsState({ selectedIssue: undefined });
  }, [locationChange]);

  const onIssueSelection = selectedIssue => setAuditlogsState({ selectedIssue });

  return (
    !!items.length && (
      <div className="fadeIn deploy-table-contain auditlogs-list">
        <div className="auditlogs-list-item auditlogs-list-item-header muted">
          {auditLogColumns.map((column, index) => (
            <div
              className="columnHeader"
              key={`columnHeader-${index}`}
              onClick={() => (column.sortable ? onChangeSorting() : null)}
              style={column.sortable ? {} : { cursor: 'initial' }}
            >
              {column.title}
              {column.sortable ? <SortIcon className={`sortIcon selected ${(sortDirection === SORTING_OPTIONS.desc).toString()}`} /> : null}
            </div>
          ))}
          <div />
        </div>
        <div className="auditlogs-list">
          {items.map(item => {
            const allowsExpansion = !!item.change || item.action.includes('terminal') || item.action.includes('portforward');
            return (
              <div
                className={`auditlogs-list-item ${allowsExpansion ? 'clickable' : ''}`}
                key={`event-${item.time}`}
                onClick={() => onIssueSelection(allowsExpansion ? item : undefined)}
              >
                {auditLogColumns.map((column, index) => column.render(item, index))}
                {allowsExpansion ? (
                  <div className="uppercased link-color bold">
                    view details <ArrowRightAltIcon />
                  </div>
                ) : (
                  <div />
                )}
              </div>
            );
          })}
        </div>
        <Loader show={loading} />
        <Pagination count={count} rowsPerPage={perPage} onChangeRowsPerPage={onChangeRowsPerPage} page={page} onChangePage={onChangePage} />
        <EventDetailsDrawer mapChangeToContent={mapChangeToContent} eventItem={selectedItem} open={Boolean(selectedItem)} onClose={() => onIssueSelection()} />
      </div>
    )
  );
};

export default AuditLogsList;
