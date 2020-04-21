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
  { title: 'Device group', renderer: DeploymentDeviceGroup },
  { title: 'Start time', renderer: DeploymentStartTime },
  { title: `End time`, renderer: DeploymentEndTime },
  { title: '# devices', class: 'align-right column-defined', renderer: DeploymentDeviceCount },
  { title: 'Status', renderer: DeploymentProgress }
];

export default class DeploymentsList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pageSize: 10
    };
  }

  render() {
    const self = this;
    const { abort, count, headers, isEnterprise, items, listClass = '', openReport, page, refreshItems, type } = self.props;
    const columnHeaders = headers ? headers : defaultHeaders;
    return (
      !!items.length && (
        <div className="fadeIn deploy-table-contain">
          <div className={`deployment-item deployment-header-item muted ${deploymentTypeClasses[type] || ''}`} style={{ paddingRight: 15 }}>
            {columnHeaders.map((item, index) => (
              <div key={`${item.title}-${index}`} className={item.class || ''}>
                {item.title}
              </div>
            ))}
          </div>
          <div className={listClass}>
            {items.map(deployment => (
              <DeploymentItem
                abort={abort}
                columnHeaders={columnHeaders}
                deployment={deployment}
                key={`${type}-deployment-${deployment.created}`}
                isEnterprise={isEnterprise}
                openReport={openReport}
                type={type}
              />
            ))}
          </div>
          {count > items.length && (
            <Pagination
              count={count}
              rowsPerPage={self.state.pageSize}
              onChangeRowsPerPage={pageSize => self.setState({ pageSize }, () => refreshItems(1, pageSize))}
              page={page}
              onChangePage={page => refreshItems(page, self.state.pageSize)}
            />
          )}
        </div>
      )
    );
  }
}
