import React from 'react';

import Pagination from '../common/pagination';
import DeploymentItem, {
  deploymentTypeClasses,
  DeploymentDeviceCount,
  DeploymentDeviceGroup,
  DeploymentEndTime,
  DeploymentStartTime,
  DeploymentProgress,
  DeploymentRelease
} from './deploymentitem';

export const defaultHeaders = [
  { title: 'Release', renderer: DeploymentRelease },
  { title: 'Target device(s)', renderer: DeploymentDeviceGroup },
  { title: 'Start time', renderer: DeploymentStartTime },
  { title: `End time`, renderer: DeploymentEndTime },
  { title: '# devices', class: 'align-right column-defined', renderer: DeploymentDeviceCount },
  { title: 'Status', renderer: DeploymentProgress }
];

const defaultRowsPerPage = 20;

export const DeploymentsList = ({
  abort,
  canDeploy,
  canConfigure,
  componentClass = '',
  count,
  headers = defaultHeaders,
  isEnterprise,
  items,
  listClass = '',
  openReport,
  onChangePage,
  onChangeRowsPerPage,
  page,
  pageSize,
  rootRef,
  showPagination,
  type
}) =>
  !!items.length && (
    <div className={`fadeIn deploy-table-contain ${componentClass}`} ref={rootRef}>
      <div className={`deployment-item deployment-header-item muted ${deploymentTypeClasses[type] || ''}`}>
        {headers.map((item, index) => (
          <div key={`${item.title}-${index}`} className={item.class || ''}>
            {item.title}
          </div>
        ))}
      </div>
      <div className={listClass}>
        {items.map(deployment => (
          <DeploymentItem
            abort={abort}
            canConfigure={canConfigure}
            canDeploy={canDeploy}
            columnHeaders={headers}
            deployment={deployment}
            key={`${type}-deployment-${deployment.created}`}
            isEnterprise={isEnterprise}
            openReport={openReport}
            type={type}
          />
        ))}
      </div>
      {(count > items.length || items.length > defaultRowsPerPage || showPagination) && (
        <Pagination count={count} rowsPerPage={pageSize} onChangeRowsPerPage={onChangeRowsPerPage} page={page} onChangePage={onChangePage} />
      )}
    </div>
  );

export default DeploymentsList;
