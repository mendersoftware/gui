import React from 'react';
import pluralize from 'pluralize';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { Chip } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import { formatTime, getPhaseDeviceCount, getRemainderPercent, groupDeploymentStats } from '../../../helpers';
import { TwoColumnData } from '../../common/configurationobject';
import Time from '../../common/time';
import { getPhaseStartTime } from '../createdeployment';
import { ProgressChart, ProgressChartContainer } from '../progressChart';
import { defaultColumnDataProps } from '../report';
import { DEPLOYMENT_STATES } from '../../../constants/deploymentConstants';
import PhaseProgress from './phaseprogress';
import LinedHeader from '../../common/lined-header';

const useStyles = makeStyles()(theme => ({
  currentPhaseInfo: { backgroundColor: theme.palette.grey[400] },
  phaseInfo: { maxWidth: maxPhaseWidth, borderRadius: 5, paddingTop: theme.spacing(), paddingBottom: theme.spacing(3) },
  phaseIndex: { alignSelf: 'flex-start', margin: theme.spacing(2), marginLeft: theme.spacing(2.5) },
  phasesOverviewArrow: { marginLeft: theme.spacing(4), marginRight: theme.spacing(4) }
}));

momentDurationFormatSetup(moment);

const maxPhaseWidth = 270;

export const RolloutSchedule = ({ deployment, headerClass, innerRef, onAbort, onUpdateControlChange }) => {
  const { classes } = useStyles();
  const now = moment();
  const {
    created: creationTime = now.toISOString(),
    device_count: deploymentDeviceCount,
    filter = {},
    finished,
    max_devices,
    phases = [{ batch_size: 100 }],
    status,
    update_control_map
  } = deployment;
  const { id: filterId } = filter;
  const { inprogress: currentProgressCount, successes: totalSuccessCount, failures: totalFailureCount } = groupDeploymentStats(deployment);
  const totalDeviceCount = Math.max(deploymentDeviceCount, max_devices || 0);

  const start_time = phases[0].start_ts || creationTime;
  const currentPhase =
    phases
      .slice()
      .reverse()
      .find(phase => now.isAfter(phase.start_ts)) || phases[0];
  const currentPhaseIndex = phases.findIndex(phase => phase.id === currentPhase.id);
  const currentPhaseStartTime = getPhaseStartTime(phases, currentPhaseIndex, start_time);
  let currentPhaseTime = 'N/A';
  if (now.isSameOrAfter(currentPhaseStartTime)) {
    currentPhaseTime = currentPhaseIndex + 1;
  }
  const endTime = finished ? <Time value={formatTime(finished)} /> : filterId ? 'N/A' : '-';
  return (
    <>
      <LinedHeader className={`margin-top-large ${headerClass}`} heading="Schedule details" innerRef={innerRef} />
      {phases.length > 1 || !update_control_map ? (
        <>
          <div className="flexbox">
            <TwoColumnData
              {...defaultColumnDataProps}
              config={{
                'Start time': <Time value={formatTime(creationTime)} />,
                'Current phase': currentPhaseTime
              }}
            />
            <ArrowForward className={classes.phasesOverviewArrow} />
            <TwoColumnData {...defaultColumnDataProps} config={{ 'End time': endTime }} />
          </div>
          <ProgressChartContainer className="margin-top" style={{ background: 'initial' }}>
            <ProgressChart
              currentPhase={currentPhase}
              currentProgressCount={currentProgressCount}
              phases={phases}
              showPhaseNumber
              totalDeviceCount={totalDeviceCount}
              totalFailureCount={totalFailureCount}
              totalSuccessCount={totalSuccessCount}
            />
          </ProgressChartContainer>
        </>
      ) : (
        <PhaseProgress deployment={deployment} onAbort={onAbort} onUpdateControlChange={onUpdateControlChange} />
      )}
      <div className="deployment-phases-report margin-top margin-bottom" style={{ gridTemplateColumns: `repeat(auto-fit, ${maxPhaseWidth}px)` }}>
        {phases.map((phase, index) => {
          phase.batch_size = phase.batch_size || getRemainderPercent(phases);
          const deviceCount = getPhaseDeviceCount(
            deployment.max_devices || deploymentDeviceCount,
            phase.batch_size,
            phase.batch_size,
            index === phases.length - 1
          );
          const deviceCountText = !filterId ? ` (${deviceCount} ${pluralize('device', deviceCount)})` : '';
          const startTime = phase.start_ts ?? getPhaseStartTime(phases, index, start_time);
          const phaseObject = {
            'Start time': <Time value={startTime} />,
            'Batch size': <div className="muted">{`${phase.batch_size}%${deviceCountText}`}</div>
          };
          let phaseTitle = status !== DEPLOYMENT_STATES.scheduled ? <div className="muted">Complete</div> : null;
          let isCurrentPhase = false;
          if (now.isBefore(startTime)) {
            const duration = moment.duration(moment(startTime).diff(now));
            phaseTitle = <div>{`Begins in ${duration.format('d [days] hh [h] mm [m]')}`}</div>;
          } else if (status === DEPLOYMENT_STATES.inprogress && phase.id === currentPhase.id) {
            phaseTitle = <div className="muted">Current phase</div>;
            isCurrentPhase = true;
          }
          return (
            <div className={`flexbox column centered ${classes.phaseInfo} ${isCurrentPhase ? classes.currentPhaseInfo : ''}`} key={startTime}>
              {phaseTitle}
              <Chip className={classes.phaseIndex} size="small" label={`Phase ${index + 1}`} />
              <TwoColumnData {...defaultColumnDataProps} style={{ ...defaultColumnDataProps.style, alignSelf: 'initial' }} config={phaseObject} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RolloutSchedule;
