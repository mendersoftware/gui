import React from 'react';
import { connect } from 'react-redux';
import { FormControl, IconButton, InputLabel, MenuItem, Select } from '@material-ui/core';
import { Add as AddIcon, Check as CheckIcon } from '@material-ui/icons';

import DistributionReport from './distribution';
import ProgressReport from './progress';
import EnterpriseNotification from '../common/enterpriseNotification';
import { selectGroup } from '../../actions/deviceActions';

const reportTypes = {
  distribution: DistributionReport,
  progress: ProgressReport
};

const defaultReports = [
  { group: null, attribute: 'device_type', type: 'distribution' },
  { group: null, attribute: 'artifact_name', type: 'distribution' },
  { group: null, attribute: 'kernel', type: 'distribution' },
  { group: null, attribute: 'os', type: 'distribution' },
  { group: 'inventory', attribute: 'artifact_name', type: 'distribution' },
  { group: null, attribute: null, type: 'progress' }
];

const defaultSelectables = { group: [], attribute: [], type: Object.keys(reportTypes) };

export class Reports extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      reports: defaultReports,
      selectables: defaultSelectables,
      selection: Object.keys(defaultSelectables).reduce((x, y) => ((x[y] = ''), x), {})
    };
  }

  componentDidMount() {
    const selectables = { ...defaultSelectables, group: Object.keys(this.props.groups), attribute: this.props.attributes };
    this.setState({ selectables });
  }

  addCurrentSelection() {
    this.setState({ adding: false, selection: {}, reports: [...this.state.reports, this.state.selection] });
  }

  removeReport(index) {
    const reports = this.state.reports;
    reports.splice(index, 1);
    this.setState({ reports });
  }

  select(selectable, value) {
    const selection = {
      ...this.state.selection,
      [selectable]: value
    };
    this.setState({ selection });
  }

  render() {
    const self = this;
    const { devices, groups, isEnterprise, selectGroup } = self.props;
    const { adding, reports, selectables, selection } = self.state;
    return !isEnterprise ? (
      <div className="flexbox centered">
        <EnterpriseNotification isEnterprise={isEnterprise} benefit="gain actionable insights into the devices you are updating with Mender" />
      </div>
    ) : (
      <>
        <div className="dashboard">
          <h4 className="dashboard-header">Reports</h4>
          <div className="flexbox margin-bottom">
            {adding ? (
              <>
                {Object.entries(selectables).map(([title, values]) => (
                  <FormControl key={`${title}-select`} style={{ marginRight: 15 }}>
                    <InputLabel id={`${title}-select`} className="capitalized-start">
                      {title}
                    </InputLabel>
                    <Select labelId={`${title}-select`} value={selection[title]} onChange={e => self.select(title, e.target.value)}>
                      <MenuItem value="">
                        <em>All Devices</em>
                      </MenuItem>
                      {values &&
                        values.length &&
                        values.map(
                          item =>
                            item && (
                              <MenuItem key={`${title}-${item}`} value={item}>
                                {item}
                              </MenuItem>
                            )
                        )}
                    </Select>
                  </FormControl>
                ))}
                {Object.values(selection).every(i => i) && (
                  <IconButton onClick={() => self.addCurrentSelection()} style={{ alignSelf: 'flex-end' }}>
                    <CheckIcon />
                  </IconButton>
                )}
              </>
            ) : (
              <IconButton onClick={() => self.setState({ adding: true })}>
                <AddIcon />
              </IconButton>
            )}
          </div>
          <div className="dashboard-header margin-bottom" />
          <div className="flexbox" style={{ flexWrap: 'wrap' }}>
            {reports.map((report, index) => {
              const Component = reportTypes[report.type];
              return (
                <Component
                  key={`report-${index}`}
                  devices={devices}
                  groups={groups}
                  group={report.group}
                  attribute={report.attribute}
                  selectGroup={selectGroup}
                  onClick={() => self.removeReport(index)}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  }
}

const actionCreators = { selectGroup };

const mapStateToProps = state => {
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    attributes: state.devices.filteringAttributes.inventoryAttributes.concat(state.devices.filteringAttributes.identityAttributes) || [],
    devices: state.devices.byId,
    groups: state.devices.groups.byId,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise')
  };
};

export default connect(mapStateToProps, actionCreators)(Reports);
