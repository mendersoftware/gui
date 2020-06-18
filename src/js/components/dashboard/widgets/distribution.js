import React from 'react';

import { IconButton } from '@material-ui/core';
import { Clear as ClearIcon } from '@material-ui/icons';
import { VictoryGroup, VictoryLabel, VictoryLegend, VictoryPie } from 'victory';

import Loader from '../../common/loader';
import Confirm from '../../common/confirm';
import { chartColorPalette } from '../../../themes/mender-theme';

export default class DistributionReport extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      distribution: [],
      removing: false
    };
  }

  componentDidMount() {
    this.initializeDistributionData();
  }

  componentDidUpdate(prevProps) {
    const { group, groups } = this.props;
    if (
      group &&
      groups &&
      (prevProps.groups !== groups || (prevProps.groups[group] && prevProps.groups[group].deviceIds.length !== groups[group].deviceIds.length))
    ) {
      this.initializeDistributionData();
    }
  }

  initializeDistributionData() {
    const { attribute, devices, group, groups } = this.props;
    const relevantDevices = group && groups[group] ? groups[group].deviceIds.map(id => devices[id]) : Object.values(devices);
    const distributionByAttribute = relevantDevices.reduce((accu, item) => {
      if (!item.attributes) return accu;
      if (!accu[item.attributes[attribute]]) {
        accu[item.attributes[attribute]] = 0;
      }
      accu[item.attributes[attribute]] = accu[item.attributes[attribute]] + 1;
      return accu;
    }, {});
    const colors = chartColorPalette.slice(0, Object.keys(distributionByAttribute).length).reverse();
    const distribution = Object.entries(distributionByAttribute)
      .sort((pairA, pairB) => pairB[1] - pairA[1])
      .slice(0, colors.length)
      .reduce((accu, [key, value], index) => [{ x: key, y: value, name: key, fill: colors[index] }, ...accu], []);
    this.setState({ distribution });
  }

  onSliceClick(thing) {
    const { attribute, group, selectGroup } = this.props;
    const filters = [{key: attribute, value: thing, operator: '$eq', scope: 'inventory'}];
    selectGroup(group, filters);
    window.location.replace(`#/devices/${group ? `group=${group}&` : ''}${attribute}=${thing}`);
  }

  render() {
    const self = this;
    const { group, groups, onClick, style } = self.props;
    const { distribution: data, removing } = self.state;
    return (
      <div className="margin-right margin-bottom widget chart-widget" style={style}>
        {removing ? (
          <Confirm
            classes="flexbox centered confirmation-overlay"
            cancel={() => self.setState({ removing: !removing })}
            action={onClick}
            style={{ height: '100%' }}
            type="chartRemoval"
          />
        ) : (
          <>
            <div className="flexbox space-between margin-left-small">
              <h4>{group || 'All devices'}</h4>
              <IconButton className="widgetRemover" onClick={() => self.setState({ removing: !removing })} style={{ alignSelf: 'flex-end' }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </div>
            {data.length ? (
              <VictoryGroup
                style={{
                  data: { fill: ({ datum }) => datum.fill },
                  parent: { display: 'flex', alignSelf: 'center', height: 'initial', width: 'initial' }
                }}
                data={data}
                width={380}
                height={230}
              >
                <VictoryLegend x={30} y={150} width={270} height={65} orientation="horizontal" itemsPerRow={3} gutter={20} />
                <VictoryPie
                  endAngle={-90}
                  events={[
                    {
                      target: 'data',
                      eventHandlers: {
                        onClick: (e, clickedProps) => self.onSliceClick(clickedProps.datum.x)
                      }
                    }
                  ]}
                  labelComponent={<VictoryLabel />}
                  radius={85}
                  startAngle={90}
                />
              </VictoryGroup>
            ) : groups[group]?.filters.length && !groups[group]?.deviceIds.length ? (
              <p className="muted flexbox centered" style={{ height: '100%' }}>
                No devices are part of this group.
              </p>
            ) : (
              <Loader show={true} />
            )}
          </>
        )}
      </div>
    );
  }
}
