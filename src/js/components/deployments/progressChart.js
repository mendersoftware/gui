import React from 'react';
import moment from 'moment';
import pluralize from 'pluralize';

import WarningIcon from '@material-ui/icons/Warning';

export default class ProgressChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: new Date()
    };
  }

  componentDidMount() {
    const self = this;
    self.timer = setInterval(() => self.setState({ time: new Date() }), 10000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    let { created, currentProgressCount, id, totalDeviceCount, totalFailureCount, totalSuccessCount, phases } = this.props;
    const { time } = this.state;

    phases = phases && phases.length ? phases : [{ id, device_count: totalSuccessCount, batch_size: totalDeviceCount, start_ts: created }];

    const currentPhase =
      phases
        .slice()
        .reverse()
        .find(phase => new Date(phase.start_ts) < time) || phases[0];
    const currentPhaseIndex = phases.findIndex(phase => phase.id === currentPhase.id);

    const nextPhaseStart = phases.length > currentPhaseIndex + 1 ? moment(phases[currentPhaseIndex + 1].start_ts) : null;
    const momentaryTime = moment(time);
    const timeToNext = nextPhaseStart
      ? {
        days: nextPhaseStart.diff(momentaryTime, 'days'),
        hours: nextPhaseStart.diff(momentaryTime, 'hours') - nextPhaseStart.diff(momentaryTime, 'days') * 24,
        minutes: nextPhaseStart.diff(momentaryTime, 'minutes') - nextPhaseStart.diff(momentaryTime, 'hours') * 60
      }
      : null;

    // to display failures per phase we have to approximate the failure count per phase by keeping track of the failures we display in previous phases and
    // deduct the phase failures from the remainder - so if we have a total of 5 failures reported and are in the 3rd phase, with each phase before reporting
    // 3 successful deployments -> the 3rd phase should end up with 1 failure so far
    const displayablePhases = phases.reduce(
      (accu, phase) => {
        // ongoing phases might not have a device_count yet - so we calculate it
        let expectedDeviceCountInPhase = Math.floor((totalDeviceCount / 100) * phase.batch_size);
        // for phases with more successes than phase.device_count or more failures than phase.device_count we have to guess what phase to put them in =>
        // because of that we have to limit per phase success/ failure counts to the phase.device_count and split the progress between those with a bias for success,
        // therefore we have to track the remaining width and work with it - until we get per phase success & failure information
        let leftoverDevices = expectedDeviceCountInPhase;
        let possiblePhaseSuccesses = Math.max(Math.min(phase.device_count, totalSuccessCount - accu.countedSuccesses), 0);
        leftoverDevices -= possiblePhaseSuccesses;
        let possiblePhaseFailures = Math.max(Math.min(leftoverDevices, totalFailureCount - accu.countedFailures), 0);
        if (phase.id === currentPhase.id) {
          phase.progressWidth = (currentProgressCount / expectedDeviceCountInPhase) * 100;
          leftoverDevices -= currentProgressCount;
          possiblePhaseFailures = Math.max(Math.min(leftoverDevices, totalFailureCount - accu.countedFailures), 0);
          leftoverDevices -= possiblePhaseSuccesses;
          possiblePhaseSuccesses = Math.max(Math.min(leftoverDevices, totalSuccessCount - accu.countedSuccesses), 0);
        }
        // if there are too few devices in a phase to register, fallback to occured deployments, as those have definitely happened
        expectedDeviceCountInPhase = Math.max(expectedDeviceCountInPhase, possiblePhaseSuccesses, currentProgressCount, possiblePhaseFailures, 0);
        phase.successWidth = (possiblePhaseSuccesses / expectedDeviceCountInPhase) * 100 || 0;
        phase.failureWidth = (possiblePhaseFailures / expectedDeviceCountInPhase) * 100 || 0;
        accu.displayablePhases.push(phase);
        accu.countedFailures += possiblePhaseFailures;
        accu.countedSuccesses += possiblePhaseSuccesses;
        return accu;
      },
      { countedFailures: 0, countedSuccesses: 0, displayablePhases: [] }
    ).displayablePhases;

    return (
      <div className={`flexbox column progress-chart-container ${this.props.className || ''}`}>
        <div className="flexbox space-between centered">
          <div className="progress-chart">
            {displayablePhases.map((phase, index) => {
              let style = { width: `${phase.batch_size}%` };
              if (index === phases.length - 1) {
                style = { flexGrow: 1, borderRight: 'none' };
              }
              return (
                <div key={`deployment-phase-${index}`} className="progress-step" style={style}>
                  <div className="progress-bar green" style={{ width: `${phase.successWidth}%` }} />
                  <div className="progress-bar warning" style={{ width: `${phase.failureWidth}%` }} />
                  {!!phase.progressWidth && <div className="progress-bar" style={{ width: `${phase.progressWidth}%`, backgroundColor: '#aaa' }} />}
                </div>
              );
            })}
            <div className="progress-step progress-step-total">
              <div className="progress-bar" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div
            className={`flexbox space-between centered ${totalFailureCount ? 'warning' : 'muted'}`}
            style={{ width: '60%', marginLeft: 15, justifyContent: 'flex-end' }}
          >
            {!!totalFailureCount && <WarningIcon style={{ fontSize: 16, marginRight: 10 }} />}
            {`${totalFailureCount} ${pluralize('failure', totalFailureCount)}`}
          </div>
        </div>
        <div className="flexbox space-between muted">
          <div>{`Current phase: ${currentPhaseIndex + 1} of ${phases.length}`}</div>
          {nextPhaseStart && (
            <div>
              <span>Time until next phase: </span>
              <span>{`${timeToNext.days} days ${timeToNext.hours}h ${timeToNext.minutes}m`}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
