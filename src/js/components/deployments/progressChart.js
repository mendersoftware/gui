import React from 'react';
import Time from 'react-time';

import pluralize from 'pluralize';

import WarningIcon from '@material-ui/icons/Warning';

export default class ProgressChart extends React.PureComponent {
  render() {
    const { current, total, failures, status } = this.props;
    const currentPercentage = (current / total) * 100;
    const totalPercentage = ((current + failures) / total) * 100;
    const nextPhaseStart = new Date('2019-09-22');
    const phases = [{ width: totalPercentage, successWidth: (currentPercentage / 3) * 2, failureWidth: Math.max(0, currentPercentage / 3 - 3) }];

    return (
      <div className="flexbox column progress-chart-container">
        <div className="flexbox space-between centered">
          <div className="progress-chart">
            {phases.map((phase, index) => {
              let style = { width: `${phase.width}%` };
              if (index === phases.length - 1) {
                style = { flexGrow: 1, borderRight: 'none' };
              }
              return (
                <div key={`deployment-phase-${index}`} className="progress-step" style={style}>
                  <div className="progress-bar green" style={{ width: `${phase.successWidth}%` }} />
                  <div className="progress-bar failure" style={{ width: `${phase.failureWidth}%` }} />
                </div>
              );
            })}
            <div className="progress-step progress-step-total">
              <div className="progress-bar" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div
            className={`flexbox space-between centered ${failures ? 'failure' : 'muted'}`}
            style={{ width: '60%', marginLeft: 15, justifyContent: 'flex-end' }}
          >
            <WarningIcon style={{ fontSize: 16, marginRight: 10 }} />
            {`${failures} ${pluralize('failure', failures)}`}
          </div>
        </div>
        <div className="flexbox space-between muted">
          <div>{`Current phase: ${current} of ${total}`}</div>
          {nextPhaseStart && (
            <div>
              <span>Time until next phase: </span>
              <Time value={nextPhaseStart} format="d h m" />
            </div>
          )}
        </div>
      </div>
    );
  }
}
