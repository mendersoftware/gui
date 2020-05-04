import React from 'react';

import { IconButton, Paper } from '@material-ui/core';
import { Clear as ClearIcon } from '@material-ui/icons';
import { VictoryPie, VictoryTooltip } from 'victory';

import Loader from '../../common/loader';
import { chartColorPalette } from '../../../themes/mender-theme';

export default class DistributionReport extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      distribution: []
    };
  }

  componentDidMount() {
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
    const colors = chartColorPalette.slice(0, Object.keys(distributionByAttribute).length);
    const distribution = Object.entries(distributionByAttribute)
      .sort((pairA, pairB) => pairB[1] - pairA[1])
      .slice(0, colors.length)
      .reduce((accu, [key, value], index) => [{ x: key, y: value, name: key, fill: colors[index] }, ...accu], []);
    this.setState({ distribution });
  }

  onSliceClick(thing) {
    const { attribute, group, selectGroup } = this.props;
    selectGroup(group);
    window.location.replace(`#/devices/${group ? `group=${group}&` : ''}${attribute}=${thing}`);
  }

  render() {
    const self = this;
    const { group, onClick, style } = self.props;
    const { distribution: data } = self.state;
    return (
      <Paper className="flexbox column margin-right margin-bottom" elevation={1} style={style}>
        <div className="flexbox space-between">
          <h4>{group || 'All devices'}</h4>
          <IconButton onClick={onClick} style={{ alignSelf: 'flex-end' }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </div>
        {data.length ? (
          <VictoryPie
            colorScale="qualitative"
            data={data}
            height={220}
            innerRadius={30}
            labelComponent={<VictoryTooltip flyoutWidth={150} constrainToVisibleArea />}
            padding={0}
            // radius={20}
            style={{
              parent: { width: 220, height: 220, display: 'flex', alignSelf: 'center' }
            }}
            width={220}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onClick: (evt, clickedProps) => self.onSliceClick(clickedProps.datum.x)
                }
              }
            ]}
          />
        ) : (
          <Loader show={true} />
        )}
      </Paper>
    );
  }
}
