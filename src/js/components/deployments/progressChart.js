import React from 'react';
import Time from 'react-time';

import pluralize from 'pluralize';

import LinearProgress from '@material-ui/core/LinearProgress';

import WarningIcon from '@material-ui/icons/Warning';

export default class ProgressChart extends React.PureComponent {
  render() {
    const { current, total, failures, status } = this.props;
    const currentPercentage = (current / total) * 100;
    const totalPercentage = ((current + failures) / total) * 100;
    const nextPhaseStart = new Date('2019-09-22');

    return (
      <div className="flexbox column">
        <div className="flexbox space-between progress-chart">
          <LinearProgress
            color={status && status.toLowerCase() == 'failure' ? 'secondary' : 'primary'}
            variant="buffer"
            value={currentPercentage}
            valueBuffer={totalPercentage}
          />
          <div className={failures ? 'red' : 'muted'} style={{ alignItems: 'center' }}>
            <WarningIcon style={{ fontSize: 16 }} />
            {` ${failures} ${pluralize('failure', failures)}`}
          </div>
        </div>
        <div className="flexbox space-between muted">
          <div>{`Current phase: ${current} of ${total}`}</div>
          {nextPhaseStart && (
            <div>
              <span>Time until next phase:</span>
              <Time value={nextPhaseStart} format="d h m" />
            </div>
          )}
        </div>
      </div>
    );
  }
}
