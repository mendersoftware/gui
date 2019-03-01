import React from 'react';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import DeploymentActivityItem from './deploymentactivityitem';

export default class DeploymentActivity extends React.PureComponent {
  render() {
    const tableStyle = {
      table: {
        marginTop: '1vh',
        marginLeft: '1vw',
        marginRight: '2vw'
      },
      header: {
        color: '#aaa',
        borderBottom: 'none'
      },
      row: {
        height: '35px',
        fontSize: '12px',
        paddingLeft: '7.5px',
        paddingRight: '5px',
        borderBottom: 'none'
      }
    };
    const tinyWidth = '4vw';
    const columns = [
      { title: 'Devices', width: 'auto' },
      { title: 'Started', width: 'auto' },
      { title: '', width: tinyWidth },
      { title: 'Status', width: 'auto' }
    ];
    return (
      <div className="activity">
        <h4>{this.props.title}</h4>
        <div style={tableStyle.table}>
          <Table>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false} style={tableStyle.header}>
              <TableRow style={Object.assign(tableStyle.header, tableStyle.row)}>
                {columns.map((item, index) => (
                  <TableHeaderColumn key={index} tooltip={item.title} style={Object.assign({ width: item.width }, tableStyle.header, tableStyle.row)}>
                    {item.title}
                  </TableHeaderColumn>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {this.props.deployments.map((item, index) => (
                <DeploymentActivityItem deployment={item} key={index} style={tableStyle.row} tinyWidth={tinyWidth} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}
