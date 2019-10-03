import React from 'react';

import Pagination from '../common/pagination';
import DeploymentItem from './deploymentitem';

const defaultHeaders = [
  { title: 'Release', class: '' },
  { title: 'Device group', class: '' },
  { title: 'Creation time', class: '' },
  { title: 'Total # devices', class: 'align-right' },
  { title: 'Status', class: '' }
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

    const { abort, count, headers, isActiveTab, openReport, page, items, refreshItems, title, type } = self.props;

    const columnHeaders = headers ? headers : defaultHeaders;

    return (
      !!items.length && (
        <div className="fadeIn deploy-table-contain">
          <h3 className="capitalized-start">{title}</h3>
          <div className="deployment-item deployment-header-item muted">
            {columnHeaders.map(item => (
              <div key={item.title} className={item.class}>
                {item.title}
              </div>
            ))}
          </div>
          {items.map((deployment, index) => (
            <DeploymentItem
              abort={abort}
              columnHeaders={columnHeaders}
              deployment={deployment}
              key={`${type}-deployment-${index}`}
              index={index}
              isActiveTab={isActiveTab}
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
