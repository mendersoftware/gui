// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { ArrowRightAlt as ArrowRightAltIcon, Sort as SortIcon } from '@mui/icons-material';

import { SORTING_OPTIONS, canAccess } from '../../constants/appConstants';
import { DEPLOYMENT_ROUTES } from '../../constants/deploymentConstants';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import Time from '../common/time';
import EventDetailsDrawer from './eventdetailsdrawer';

export const defaultRowsPerPage = 20;

const ArtifactLink = ({ item }) => <Link to={`/releases/${item.object.artifact.name}`}>View artifact</Link>;
const DeploymentLink = ({ item }) => <Link to={`${DEPLOYMENT_ROUTES.finished.route}?open=true&id=${item.object.id}`}>View deployment</Link>;
const DeviceLink = ({ item }) => <Link to={`/devices?id=${item.object.id}`}>View device</Link>;
const DeviceRejectedLink = ({ item }) => <Link to={`/devices/rejected?id=${item.object.id}`}>View device</Link>;
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

const defaultAccess = canAccess;
const changeMap = {
  default: { component: 'div', actionFormatter: fallbackFormatter, title: 'defaultTitle', accessCheck: defaultAccess },
  artifact: { actionFormatter: data => decodeURIComponent(data.artifact.name), component: ArtifactLink, accessCheck: ({ canReadReleases }) => canReadReleases },
  deployment: {
    actionFormatter: data => decodeURIComponent(data.deployment.name),
    component: DeploymentLink,
    accessCheck: ({ canReadDeployments }) => canReadDeployments
  },
  deviceDecommissioned: { actionFormatter: data => decodeURIComponent(data.id), component: 'div', accessCheck: defaultAccess },
  deviceRejected: { actionFormatter: data => decodeURIComponent(data.id), component: DeviceRejectedLink, accessCheck: ({ canReadDevices }) => canReadDevices },
  deviceGeneral: { actionFormatter: data => decodeURIComponent(data.id), component: DeviceLink, accessCheck: ({ canReadDevices }) => canReadDevices },
  deviceTerminalSession: { actionFormatter: data => decodeURIComponent(data.id), component: TerminalSessionLink, accessCheck: defaultAccess },
  user: { component: UserChange, actionFormatter: data => data.user.email, accessCheck: defaultAccess }
};

const mapChangeToContent = item => {
  let content = changeMap[item.object.type];
  if (content) {
    return content;
  } else if (item.object.type === 'device' && item.action.includes('terminal')) {
    content = changeMap.deviceTerminalSession;
  } else if (item.object.type === 'device' && item.action.includes('reject')) {
    content = changeMap.deviceRejected;
  } else if (item.object.type === 'device' && item.action.includes('decommission')) {
    content = changeMap.deviceDecommissioned;
  } else if (item.object.type === 'device') {
    content = changeMap.deviceGeneral;
  } else {
    content = changeMap.default;
  }
  return content;
};

const actorMap = {
  user: 'email',
  device: 'id'
};

const UserDescriptor = (item, index) => <div key={`${item.time}-${index} `}>{item.actor[actorMap[item.actor.type]]}</div>;
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
const ChangeDetailsDescriptor = (item, index, userCapabilities) => {
  const { component: Comp, accessCheck } = mapChangeToContent(item);
  const key = `${item.time}-${index}`;
  return accessCheck(userCapabilities) ? <Comp key={key} item={item} /> : <div key={key} />;
};
const TimeWrapper = (item, index) => <Time key={`${item.time}-${index}`} value={item.time} />;

const auditLogColumns = [
  { title: 'User', sortable: false, render: UserDescriptor },
  { title: 'Action', sortable: false, render: ActionDescriptor },
  { title: 'Type', sortable: false, render: TypeDescriptor },
  { title: 'Changed', sortable: false, render: ChangeDescriptor },
  { title: 'More details', sortable: false, render: ChangeDetailsDescriptor },
  { title: 'Time', sortable: true, render: TimeWrapper }
];

export const AuditLogsList = ({ items, loading, onChangePage, onChangeRowsPerPage, onChangeSorting, selectionState, setAuditlogsState, userCapabilities }) => {
  const { page, perPage, selectedId, sort = {}, total: count } = selectionState;

  const onIssueSelection = selectedIssue =>
    setAuditlogsState({ selectedId: selectedIssue ? btoa(`${selectedIssue.action}|${selectedIssue.time}`) : undefined });

  const eventItem = useMemo(() => {
    if (!selectedId) {
      return;
    }
    const [eventAction, eventTime] = atob(selectedId).split('|');
    return items.find(item => item.action === eventAction && item.time === eventTime);
  }, [items, selectedId]);

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
              {column.sortable ? <SortIcon className={`sortIcon selected ${(sort.direction === SORTING_OPTIONS.desc).toString()}`} /> : null}
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
                {auditLogColumns.map((column, index) => column.render(item, index, userCapabilities))}
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
        <EventDetailsDrawer eventItem={eventItem} open={Boolean(eventItem)} onClose={() => onIssueSelection()} />
      </div>
    )
  );
};

export default AuditLogsList;
