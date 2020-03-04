import React from 'react';

import { Paper } from '@material-ui/core';
import { VictoryPie } from 'victory';

import Loader from '../../common/loader';

export default class SoftwareDistribution extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      softwareDistribution: {}
    };
  }

  componentDidMount() {
    const softwareDistribution = Object.values(this.props.devices).reduce((accu, item) => {
      if (!item.attributes) return accu;
      if (!accu[item.attributes.artifact_name]) {
        accu[item.attributes.artifact_name] = 0;
      }
      accu[item.attributes.artifact_name] = accu[item.attributes.artifact_name] + 1;
      return accu;
    }, {});
    this.setState({ softwareDistribution });
  }

  render() {
    const { softwareDistribution } = this.state;
    const data = Object.entries(softwareDistribution).reduce((accu, [key, value]) => [...accu, { x: key, y: value }], []);
    return (
      <Paper className="widget" elevation={2}>
        {Object.keys(softwareDistribution).length ? (
          // <svg viewBox="0 0 210 140">
          <VictoryPie
            colorScale="qualitative"
            standalone={true}
            width={140}
            padding={0}
            height={140}
            data={data}
            innerRadius={24}
            // radius={20}
            labelRadius={5}
            style={{
              labels: { fontSize: 14, fill: 'white' },
              parent: { width: 140, height: 140, display: 'flex', alignSelf: 'center' }
            }}
          />
        ) : (
          //   <VictoryLabel textAnchor="middle" style={{ fontSize: 16 }} x={70} y={70} text="Software Distribution" />
          // </svg>
          <Loader show={true} />
        )}
      </Paper>
    );
  }
}
