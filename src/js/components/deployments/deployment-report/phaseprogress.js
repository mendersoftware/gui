import React, { useEffect, useState } from 'react';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import pluralize from 'pluralize';

import { Button } from '@material-ui/core';
import { CheckCircle, ErrorRounded, Pause, PlayArrow, Warning as WarningIcon } from '@material-ui/icons';

import { deploymentDisplayStates, installationSubstatesMap, pauseMap } from '../../../constants/deploymentConstants';
import { getDeploymentState, groupDeploymentStats, statCollector } from '../../../helpers';
import Confirm from '../../common/confirm';
import theme, { colors } from '../../../themes/mender-theme';
import inprogressImage from '../../../../assets/img/pending_status.png';

momentDurationFormatSetup(moment);

const shortCircuitIndicators = ['already-installed', 'noartifact'];

const substateIconMap = {
  finished: { state: 'finished', icon: <CheckCircle fontSize="small" /> },
  inprogress: { state: 'inprogress', icon: <img src={inprogressImage} /> },
  failed: { state: 'failed', icon: <ErrorRounded fontSize="small" /> },
  paused: { state: 'paused', icon: <Pause fontSize="small" /> },
  pendingPause: { state: 'pendingPause', icon: <Pause fontSize="small" color="disabled" /> }
};

const fullWidthStyle = { width: '100%' };
const stepHeight = { compact: 20, default: '100%' };

const phaseDelimiterStyle = {
  display: 'grid',
  rowGap: 4,
  placeItems: 'center',
  position: 'absolute'
};

const PhaseDelimiter = ({ compact, delimiterStyle, index, isActive, isFinal, status, substate, stepTotalWidth }) => {
  const offset = `${stepTotalWidth * (index + 1) - stepTotalWidth / 2}%`;
  const width = `${stepTotalWidth}%`;
  let borderColor = isActive ? colors.textColor : colors.borderColor;
  borderColor = isFinal ? 'transparent' : borderColor;
  const border = <div style={{ borderLeft: `${borderColor} ${delimiterStyle} 1px`, height: '100%', zIndex: 1 }} />;
  const icon = substateIconMap[status] && !isFinal ? substateIconMap[status].icon : <div />;
  return (
    <div style={{ ...phaseDelimiterStyle, gridTemplateRows: `${compact ? 45 : stepHeight.compact}px 1.25rem min-content`, left: offset, width }}>
      {border}
      {icon}
      {compact ? <div /> : <div className="capitalized slightly-smaller">{substate}</div>}
    </div>
  );
};

const ProgressChart = ({ deployment = {}, showDetails, style }) => {
  const { device_count = 0, max_devices = 0, stats, update_control_map = {} } = deployment;
  const totalDeviceCount = Math.max(device_count, max_devices);

  const determineSubstateStatus = (successes, failures, totalDeviceCount, pauseIndicator, hasPauseDefined) => {
    let status;
    if (successes === totalDeviceCount) {
      status = substateIconMap.finished.state;
    } else if (failures === totalDeviceCount) {
      status = substateIconMap.failed.state;
    } else if (pauseIndicator) {
      status = substateIconMap.paused.state;
    } else if (successes || failures) {
      status = substateIconMap.inprogress.state;
    } else if (hasPauseDefined) {
      status = substateIconMap.pendingPause.state;
    }
    return status;
  };

  const { displayablePhases } = Object.values(installationSubstatesMap).reduce(
    (accu, substate, index) => {
      let successes = statCollector(substate.successIndicators, stats);
      successes = Math.min(totalDeviceCount, successes + accu.shortCutSuccesses);
      let failures = statCollector(substate.failureIndicators, stats);
      if (index) {
        // make sure to only include "final" stats from completed deployment substates if there are non-final stats/
        // the substate is actually running
        if (accu.displayablePhases[index - 1].failures + accu.displayablePhases[index - 1].success === totalDeviceCount) {
          failures = accu.displayablePhases[index - 1].failures;
        } else {
          failures = 0;
        }
      }
      failures = Math.min(totalDeviceCount - successes, failures);
      const successWidth = `${(successes / totalDeviceCount) * 100 || 0}%`;
      const failureWidth = `${(failures / totalDeviceCount) * 100 || 0}%`;
      const { states = {} } = update_control_map;
      const hasPauseDefined = states[substate.pauseConfigurationIndicator]?.action === 'pause';
      const status = determineSubstateStatus(successes, failures, totalDeviceCount, !!stats[substate.pauseIndicator], hasPauseDefined);
      accu.displayablePhases.push({ substate, successes, failures, successWidth, failureWidth, status });
      return accu;
    },
    { displayablePhases: [], shortCutSuccesses: statCollector(shortCircuitIndicators, stats) }
  );

  const stepTotalWidth = 100 / Object.keys(installationSubstatesMap).length;
  const stepWidth = `${stepTotalWidth}%`;
  const height = showDetails ? stepHeight.details : stepHeight.default;
  const stepStyle = { border: 'none', width: stepWidth, height };
  return (
    <>
      {!showDetails && (
        <>
          Phase 1: {Math.round((device_count / totalDeviceCount || 0) * 100)}% ({device_count} {pluralize('device', device_count)})
        </>
      )}
      <div className={`progress-chart ${!showDetails ? 'detailed' : ''}`} style={style}>
        {displayablePhases.map((phase, index) => {
          return (
            <React.Fragment key={`deployment-progress-phase-${index}`}>
              <div className="progress-step" style={{ ...stepStyle, position: 'absolute', left: `${stepTotalWidth * index}%` }}>
                <div className="flexbox" style={fullWidthStyle}>
                  <div className="progress-bar green" style={{ width: phase.successWidth }} />
                  <div className="progress-bar warning" style={{ width: phase.failureWidth }} />
                </div>
                {!showDetails && (
                  <div className="progress-step-number" style={{ alignSelf: 'flex-end', marginBottom: -20 }}>
                    {phase.substate.title}
                  </div>
                )}
              </div>
              <PhaseDelimiter
                compact={!showDetails}
                isActive={phase.status === substateIconMap.inprogress.state}
                isFinal={index === displayablePhases.length - 1}
                substate={phase.substate.done}
                status={phase.status}
                stepTotalWidth={stepTotalWidth}
                index={index}
                delimiterStyle="solid"
              />
            </React.Fragment>
          );
        })}
        <div className="progress-step progress-step-total" style={{ height }}>
          <div className="progress-bar" style={fullWidthStyle}></div>
        </div>
      </div>
    </>
  );
};

const statusMap = {
  inprogress: <PlayArrow fontSize="inherit" />,
  paused: <Pause fontSize="inherit" />
};

export const PhaseProgressDisplay = ({ className = '', deployment, status }) => {
  const { failures } = groupDeploymentStats(deployment);
  return (
    <div className={`flexbox column progress-chart-container stepped-progress ${className}`}>
      <div className="flexbox space-between" style={{ marginBottom: theme.spacing() }}>
        {statusMap[status] ? statusMap[status] : <div />}
        <div className="flexbox center-aligned">
          {!!failures && <WarningIcon style={{ fontSize: 16, marginRight: 10 }} />}
          {`${failures} ${pluralize('failure', failures)}`}
        </div>
      </div>
      <div className="muted slightly-smaller" style={{ margin: theme.spacing(0.5) }}>
        Phase 1 of 1
      </div>
      <ProgressChart deployment={deployment} showDetails style={{ maxWidth: '90%', minHeight: 65 }} />
    </div>
  );
};

const confirmationStyle = {
  justifyContent: 'flex-start',
  paddingLeft: 100
};

export const PhaseProgress = ({ className = '', deployment = {}, onAbort, onUpdateControlChange }) => {
  const [shouldContinue, setShouldContinue] = useState(false);
  const [shouldAbort, setShouldAbort] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { id, stats, update_control_map = {} } = deployment;
  const { states = {} } = update_control_map;
  const { failures: totalFailureCount } = groupDeploymentStats(deployment);

  const status = getDeploymentState(deployment);
  const currentPauseState = Object.keys(pauseMap)
    .reverse()
    .find(key => stats[key] > 0);

  useEffect(() => {
    if (!isLoading) {
      return;
    }
    setIsLoading(false);
  }, [status]);

  const onAbortClick = () => {
    setShouldAbort(false);
    onAbort(id);
  };

  const onContinueClick = () => {
    setIsLoading(true);
    setShouldContinue(false);
    onUpdateControlChange({ states: { [pauseMap[currentPauseState].followUp]: { action: 'continue' } } });
  };

  const disableContinuationButtons =
    isLoading || (status === deploymentDisplayStates.paused && states[pauseMap[currentPauseState].followUp].action === 'continue');
  return (
    <div className={`flexbox column ${className}`}>
      <div className="progress-chart-container stepped-progress" style={{ background: 'none' }}>
        <ProgressChart deployment={deployment} />
      </div>
      <div className="margin-top">
        Deployment is <span className="uppercased">{status}</span> with {totalFailureCount} {pluralize('failure', totalFailureCount)}
      </div>
      {status === deploymentDisplayStates.paused && (
        <div className="margin-top margin-bottom relative">
          {shouldContinue && (
            <Confirm
              type="deploymentContinuation"
              classes="confirmation-overlay"
              action={onContinueClick}
              cancel={() => setShouldContinue(false)}
              style={confirmationStyle}
            />
          )}
          {shouldAbort && (
            <Confirm
              type="deploymentAbort"
              classes="confirmation-overlay"
              action={onAbortClick}
              cancel={() => setShouldAbort(false)}
              style={confirmationStyle}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            disabled={disableContinuationButtons}
            onClick={setShouldContinue}
            style={{ marginRight: theme.spacing(2) }}
          >
            Continue
          </Button>
          <Button disabled={disableContinuationButtons} onClick={setShouldAbort}>
            Abort
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhaseProgress;
