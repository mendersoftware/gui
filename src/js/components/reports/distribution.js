import React from 'react';

import { IconButton, Paper } from '@material-ui/core';
import { Clear as ClearIcon } from '@material-ui/icons';
import { VictoryPie, VictoryTooltip } from 'victory';

import Loader from '../common/loader';

export default class DistributionReport extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      distribution: {}
    };
  }

  componentDidMount() {
    const { attribute, devices, group, groups } = this.props;
    const relevantDevices = group && groups[group] ? groups[group].deviceIds.map(id => devices[id]) : Object.values(devices);
    const distribution = relevantDevices.reduce((accu, item) => {
      if (!item.attributes) return accu;
      if (!accu[item.attributes[attribute]]) {
        accu[item.attributes[attribute]] = 0;
      }
      accu[item.attributes[attribute]] = accu[item.attributes[attribute]] + 1;
      return accu;
    }, {});
    this.setState({ distribution });
  }

  onSliceClick(thing) {
    const { attribute, group, selectGroup } = this.props;
    selectGroup(group);
    window.location.replace(`#/devices/${group ? `group=${group}&` : ''}${attribute}=${thing}`);
  }

  render() {
    const self = this;
    const { attribute, group, onClick } = self.props;
    const data = Object.entries(this.state.distribution).reduce((accu, [key, value]) => [...accu, { x: key, y: value }], []);
    return (
      <Paper className="flexbox column centered space-between margin-right margin-bottom" elevation={2} style={{ minWidth: 380, width: 380 }}>
        {data.length ? (
          <>
            <IconButton onClick={onClick} style={{ alignSelf: 'flex-end' }}>
              <ClearIcon fontSize="small" />
            </IconButton>
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
            <h4 className="flexbox centered">{`${attribute} in ${group || 'All devices'}`}</h4>
          </>
        ) : (
          <Loader show={true} />
        )}
      </Paper>
    );
  }
}
