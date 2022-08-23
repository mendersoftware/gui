import React, { useEffect, useState } from 'react';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import pluralize from 'pluralize';

import { Button } from '@mui/material';
import { CheckCircle, ErrorRounded, Pause, PlayArrow, Warning as WarningIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import { deploymentDisplayStates, deploymentSubstates, installationSubstatesMap, pauseMap } from '../../../constants/deploymentConstants';
import { getDeploymentState, groupDeploymentStats, statCollector } from '../../../helpers';
import Confirm from '../../common/confirm';
import inprogressImage from '../../../../assets/img/pending_status.png';
import { ProgressChartContainer } from '../progressChart';

const fullWidthStyle = { width: '100%' };
const stepHeight = { compact: 20, default: '100%' };

const useStyles = makeStyles()(theme => ({
  active: { borderLeftColor: theme.palette.text.primary },
  borderColor: { borderLeftStyle: 'solid', borderLeftWidth: 1, height: '100%', zIndex: 1 },
  continueButton: { marginRight: theme.spacing(2) },
  inactive: { borderLeftColor: theme.palette.grey[500] },
  phaseInfo: { marginBottom: theme.spacing() },
  phaseIndex: { margin: theme.spacing(0.5) },
  phaseDelimiter: {
    display: 'grid',
    rowGap: 4,
    placeItems: 'center',
    position: 'absolute',
    gridTemplateRows: `${stepHeight.compact}px 1.25rem min-content`,
    ['&.compact']: {
      gridTemplateRows: '45px 1.25rem min-content'
    }
  },
  progressBarBackground: { position: 'initial', width: '110%' },
  progressStepNumber: { alignSelf: 'flex-end', marginBottom: -20 }
}));

momentDurationFormatSetup(moment);

const shortCircuitIndicators = [deploymentSubstates.alreadyInstalled, deploymentSubstates.noartifact];

const substateIconMap = {
  finished: { state: 'finished', icon: <CheckCircle fontSize="small" /> },
  inprogress: { state: 'inprogress', icon: <img src={inprogressImage} /> },
  failed: { state: 'failed', icon: <ErrorRounded fontSize="small" /> },
  paused: { state: 'paused', icon: <Pause fontSize="small" /> },
  pendingPause: { state: 'pendingPause', icon: <Pause fontSize="small" color="disabled" /> }
};

const PhaseDelimiter = ({ compact, index, isActive, status, substate, stepTotalWidth }) => {
  const offset = `${stepTotalWidth * (index + 1) - stepTotalWidth / 2}%`;
  const width = `${stepTotalWidth}%`;
  const { classes } = useStyles();
  const border = <div className={`${classes.borderColor} ${isActive ? classes.active : classes.inactive}`} />;
  const icon = substateIconMap[status] ? substateIconMap[status].icon : <div />;
  return (
    <div className={`${classes.phaseDelimiter} ${compact ? 'compact' : ''}`} style={{ left: offset, width }}>
      {border}
      {icon}
      {compact ? <div /> : <div className="capitalized slightly-smaller">{substate}</div>}
    </div>
  );
};

const ProgressChart = ({ deployment = {}, showDetails, style }) => {
  const { device_count = 0, max_devices = 0, stats, update_control_map = {} } = deployment;
  const totalDeviceCount = Math.max(device_count, max_devices);
  const { classes } = useStyles();

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

  const currentPauseState = Object.keys(pauseMap)
    .reverse()
    .find(key => stats[key] > 0);
  const { displayablePhases } = Object.values(installationSubstatesMap).reduce(
    (accu, substate, index) => {
      let successes = statCollector(substate.successIndicators, stats);
      let failures = statCollector(substate.failureIndicators, stats);
      if (
        !currentPauseState ||
        index <= Object.keys(pauseMap).indexOf(currentPauseState) ||
        (index && accu.displayablePhases[index - 1].failures + accu.displayablePhases[index - 1].success === totalDeviceCount)
      ) {
        failures = accu.displayablePhases[index - 1]?.failures || failures;
        successes = successes + accu.shortCutSuccesses;
      }
      successes = Math.min(totalDeviceCount, successes);
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
              <div className="progress-step" style={{ width: stepWidth, height, left: `${stepTotalWidth * index}%` }}>
                <div className="flexbox" style={fullWidthStyle}>
                  <div className="progress-bar green" style={{ width: phase.successWidth }} />
                  <div className="progress-bar warning" style={{ width: phase.failureWidth }} />
                </div>
                {!showDetails && <div className={`progress-step-number ${classes.progressStepNumber}`}>{phase.substate.title}</div>}
              </div>
              {index !== displayablePhases.length - 1 && (
                <PhaseDelimiter
                  compact={!showDetails}
                  isActive={phase.status === substateIconMap.inprogress.state}
                  substate={phase.substate.done}
                  status={phase.status}
                  stepTotalWidth={stepTotalWidth}
                  index={index}
                />
              )}
            </React.Fragment>
          );
        })}
        <div className="progress-step progress-step-total" style={{ height }}>
          <div className={`progress-bar ${classes.progressBarBackground}`} />
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
  const { classes } = useStyles();
  const { failures } = groupDeploymentStats(deployment);
  return (
    <ProgressChartContainer className={`flexbox column stepped-progress ${className}`}>
      <div className={`flexbox space-between ${classes.phaseInfo}`}>
        {statusMap[status] ? statusMap[status] : <div />}
        <div className="flexbox center-aligned">
          {!!failures && <WarningIcon style={{ fontSize: 16, marginRight: 10 }} />}
          {`${failures} ${pluralize('failure', failures)}`}
        </div>
      </div>
      <div className={`muted slightly-smaller ${classes.phaseIndex}`}>Phase 1 of 1</div>
      <ProgressChart deployment={deployment} showDetails style={{ maxWidth: '90%', minHeight: 65 }} />
    </ProgressChartContainer>
  );
};

const confirmationStyle = {
  justifyContent: 'flex-start',
  paddingLeft: 100
};

export const PhaseProgress = ({ className = '', deployment = {}, onAbort, onUpdateControlChange }) => {
  const { classes } = useStyles();
  const [shouldContinue, setShouldContinue] = useState(false);
  const [shouldAbort, setShouldAbort] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { id, stats = {}, update_control_map = {} } = deployment;
  const { states = {} } = update_control_map;
  const { failures: totalFailureCount, paused: totalPausedCount } = groupDeploymentStats(deployment);

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

  const isPaused = status === deploymentDisplayStates.paused;
  const canContinue = isPaused && states[pauseMap[currentPauseState].followUp];
  const disableContinuationButtons = isLoading || (canContinue && states[pauseMap[currentPauseState].followUp].action !== 'pause');
  return (
    <div className={`flexbox column ${className}`}>
      <ProgressChartContainer className="stepped-progress" style={{ background: 'none' }}>
        <ProgressChart deployment={deployment} />
      </ProgressChartContainer>
      <div className="margin-top">
        Deployment is <span className="uppercased">{status}</span> with {totalFailureCount} {pluralize('failure', totalFailureCount)}
        {isPaused && !canContinue && ` - waiting for an action on the ${pluralize('device', totalPausedCount)} to continue`}
      </div>
      {canContinue && (
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
          <Button color="primary" disabled={disableContinuationButtons} onClick={setShouldContinue} variant="contained" className={classes.continueButton}>
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
