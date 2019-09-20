import React from 'react';

import Pagination from '../common/pagination';
import DeploymentItem from './deploymentitem';

const columnHeaders = [
  { title: 'Release', class: '' },
  { title: 'Device group', class: '' },
  { title: 'Creation time', class: '' },
  { title: 'Total # devices', class: 'align-right' },
  { title: 'Status', class: '' }
];

export default class Pending extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      abort: null,
      pageSize: 20
    };
  }
  _abortHandler(id) {
    this.props.abort(id);
  }
  _hideConfirm() {
    var self = this;
    setTimeout(() => {
      self.setState({ abort: null });
    }, 150);
  }
  _showConfirm(id) {
    this.setState({ abort: id });
  }
  _handlePageChange(pageNo) {
    this.props.refreshPending(pageNo);
  }
  render() {
    const self = this;
    const pendingMap = this.props.pending.map((deployment, index) => (
      <DeploymentItem
        abort={this.props.abort}
        columnHeaders={columnHeaders}
        deployment={deployment}
        key={`deployment-${index}`}
        index={index}
        isActiveTab={this.props.isActiveTab}
        openReport={this.props.openReport}
        type="pending"
      />
    ));

    return (
      <div className="fadeIn deploy-table-contain">
        {pendingMap.length ? (
          <div>
            <h3>Pending</h3>
            <div className="deployment-item deployment-header-item muted">
              {columnHeaders.map(item => (
                <div key={item.title} className={item.class}>
                  {item.title}
                </div>
              ))}
            </div>
            {pendingMap}
          </div>
        ) : null}
        {this.props.count > this.props.pending.length ? (
          <Pagination
            count={self.props.count}
            rowsPerPage={self.state.pageSize}
            onChangeRowsPerPage={pageSize => self.setState({ pageSize }, () => self.props.refreshPending(1, pageSize))}
            page={self.props.page}
            onChangePage={page => self.props.refreshPending(page, self.state.pageSize)}
          />
        ) : null}
      </div>
    );
  }
}
