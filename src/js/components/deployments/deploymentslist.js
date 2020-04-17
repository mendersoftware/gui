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
  { title: '# devices', class: 'align-right', renderer: DeploymentDeviceCount },
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

    const { abort, count, headers, openReport, page, items, isEnterprise, refreshItems, title, type } = self.props;

    const columnHeaders = headers ? headers : defaultHeaders;

    return (
      !!items.length && (
        <div className="fadeIn deploy-table-contain">
          <h3 className="capitalized-start">{title}</h3>
          <div className={`deployment-item deployment-header-item muted ${deploymentTypeClasses[type] || ''}`}>
            {columnHeaders.map((item, index) => (
              <div key={`${item.title}-${index}`} className={item.class || ''}>
                {item.title}
              </div>
            ))}
          </div>
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
