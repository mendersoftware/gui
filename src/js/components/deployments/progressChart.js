import React, { useEffect, useState } from 'react';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import pluralize from 'pluralize';

import { SvgIcon, Tooltip } from '@material-ui/core';
import { RotateLeftOutlined, Warning as WarningIcon } from '@material-ui/icons';
import { mdiDotsHorizontalCircleOutline as QueuedIcon, mdiSleep as SleepIcon } from '@mdi/js';

import { groupDeploymentStats } from '../../helpers';
import LocaleTime from '../common/localetime';

momentDurationFormatSetup(moment);

const statusMap = {
  complete: {
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={SleepIcon} />
      </SvgIcon>
    ),
    description: () => 'Complete, awaiting new devices'
  },
  queued: {
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={QueuedIcon} />
      </SvgIcon>
    ),
    description: () => 'Queued to start'
  },
  paused: { icon: <RotateLeftOutlined fontSize="inherit" />, description: window => `Paused until next window ${window}` }
};

export const ProgressChart = ({ currentPhase, currentProgressCount, phases, showPhaseNumber, totalDeviceCount, totalFailureCount, totalSuccessCount }) => {
  // to display failures per phase we have to approximate the failure count per phase by keeping track of the failures we display in previous phases and
  // deduct the phase failures from the remainder - so if we have a total of 5 failures reported and are in the 3rd phase, with each phase before reporting
  // 3 successful deployments -> the 3rd phase should end up with 1 failure so far
  const displayablePhases = phases.reduce(
    (accu, phase) => {
      let displayablePhase = { ...phase };
      // ongoing phases might not have a device_count yet - so we calculate it
      let expectedDeviceCountInPhase = Math.floor((totalDeviceCount / 100) * displayablePhase.batch_size) || displayablePhase.batch_size;
      // for phases with more successes than phase.device_count or more failures than phase.device_count we have to guess what phase to put them in =>
      // because of that we have to limit per phase success/ failure counts to the phase.device_count and split the progress between those with a bias for success,
      // therefore we have to track the remaining width and work with it - until we get per phase success & failure information
      let leftoverDevices = expectedDeviceCountInPhase;
      const possiblePhaseSuccesses = Math.max(Math.min(displayablePhase.device_count, totalSuccessCount - accu.countedSuccesses), 0);
      leftoverDevices -= possiblePhaseSuccesses;
      const possiblePhaseFailures = Math.max(Math.min(leftoverDevices, totalFailureCount - accu.countedFailures), 0);
      leftoverDevices -= possiblePhaseFailures;
      const possiblePhaseProgress = Math.max(Math.min(leftoverDevices, currentProgressCount - accu.countedProgress), 0);
      // if there are too few devices in a phase to register, fallback to occured deployments, as those have definitely happened
      expectedDeviceCountInPhase = Math.max(expectedDeviceCountInPhase, possiblePhaseSuccesses + possiblePhaseProgress + possiblePhaseFailures, 0);
      displayablePhase.successWidth = (possiblePhaseSuccesses / expectedDeviceCountInPhase) * 100 || 0;
      displayablePhase.failureWidth = (possiblePhaseFailures / expectedDeviceCountInPhase) * 100 || 0;
      if (displayablePhase.id === currentPhase.id || leftoverDevices > 0) {
        displayablePhase.progressWidth = (possiblePhaseProgress / expectedDeviceCountInPhase) * 100;
        accu.countedProgress += possiblePhaseProgress;
      }
      accu.countedFailures += possiblePhaseFailures;
      accu.countedSuccesses += possiblePhaseSuccesses;
      accu.displayablePhases.push(displayablePhase);
      return accu;
    },
    { countedFailures: 0, countedSuccesses: 0, countedProgress: 0, displayablePhases: [] }
  ).displayablePhases;

  return (
    <div className={`progress-chart ${showPhaseNumber ? 'detailed' : ''}`}>
      <div className="progress-step progress-step-total">
        <div className="progress-bar"></div>
      </div>
      {displayablePhases.map((phase, index) => {
        let style = { width: `${phase.batch_size}%` };
        if (index === phases.length - 1) {
          style = { flexGrow: 1, borderRight: 'none' };
        }
        return (
          <div key={`deployment-phase-${index}`} className="progress-step" style={style}>
            {showPhaseNumber && <div className="progress-step-number text-muted">{`Phase ${index + 1}`}</div>}
            {!!phase.progressWidth && <div className="progress-bar" style={{ width: `${phase.progressWidth}%`, backgroundColor: '#aaa' }} />}
            <div className="flexbox progress-bar" style={{ backgroundColor: 'initial' }}>
              <div className="progress-bar green" style={{ width: `${phase.successWidth}%` }} />
              <div className="progress-bar warning" style={{ width: `${phase.failureWidth}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const DeploymentStatusNotification = ({ status }) => (
  <div className="flexbox center-aligned">
    {statusMap[status].icon}
    <span className="margin-left-small">{statusMap[status].description()}</span>
  </div>
);

let timer;
export const ProgressDisplay = ({ className = '', deployment, status }) => {
  const [time, setTime] = useState(new Date());

  const { created, device_count, id, phases: deploymentPhases = [], max_devices } = deployment;
  const { inprogress: currentProgressCount, successes: totalSuccessCount, failures: totalFailureCount } = groupDeploymentStats(deployment);
  const totalDeviceCount = Math.max(device_count, max_devices || 0);

  useEffect(() => {
    timer = setInterval(updateTime, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const updateTime = () => setTime(new Date());

  let phases = deploymentPhases.length ? deploymentPhases : [{ id, device_count: totalSuccessCount, batch_size: totalDeviceCount, start_ts: created }];

  const currentPhase =
    phases
      .slice()
      .reverse()
      .find(phase => new Date(phase.start_ts) < time) || phases[0];
  const currentPhaseIndex = phases.findIndex(phase => phase.id === currentPhase.id);
  const nextPhaseStart = phases.length > currentPhaseIndex + 1 ? moment(phases[currentPhaseIndex + 1].start_ts) : moment(time);
  const momentaryTime = moment(time);
  const duration = moment.duration(nextPhaseStart.diff(momentaryTime));

  return (
    <div className={`flexbox column progress-chart-container ${className}`}>
      {statusMap[status] && (
        <span className="flexbox center-aligned small text-muted">
          {statusMap[status].icon}
          <span className="margin-left-small">{statusMap[status].description()}</span>
        </span>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridColumnGap: 15 }}>
        <ProgressChart
          currentPhase={currentPhase}
          currentProgressCount={currentProgressCount}
          phases={phases}
          totalDeviceCount={totalDeviceCount}
          totalFailureCount={totalFailureCount}
          totalSuccessCount={totalSuccessCount}
        />
        <div className={`flexbox center-aligned ${totalFailureCount ? 'warning' : 'muted'}`} style={{ justifyContent: 'flex-end' }}>
          {!!totalFailureCount && <WarningIcon style={{ fontSize: 16, marginRight: 10 }} />}
          {`${totalFailureCount} ${pluralize('failure', totalFailureCount)}`}
        </div>
      </div>
      <div className="flexbox space-between muted">
        <div>Devices in progress</div>
        {phases.length > 1 && phases.length > currentPhaseIndex + 1 ? (
          <div>
            <span>Time until next phase: </span>
            <Tooltip title={<LocaleTime value={nextPhaseStart.toDate()} />} placement="top">
              <span>{`${duration.format('d [days] hh [h] mm [m] ss [s]')}`}</span>
            </Tooltip>
          </div>
        ) : (
          <div>{`Current phase: ${currentPhaseIndex + 1} of ${phases.length}`}</div>
        )}
      </div>
    </div>
  );
};

export default ProgressDisplay;
