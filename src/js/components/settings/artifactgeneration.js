import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import { Checkbox, FormControlLabel, TextField, Typography, formControlLabelClasses, textFieldClasses } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import DeltaIcon from '../../../assets/img/deltaicon.svg';
import { getDeploymentsConfig, saveDeltaDeploymentsConfig } from '../../actions/deploymentActions';
import { TIMEOUTS } from '../../constants/appConstants';
import { UNSET_LIMIT } from '../../constants/deploymentConstants';
import { useDebounce } from '../../utils/debouncehook';
import InfoText from '../common/infotext';

const useStyles = makeStyles()(theme => ({
  deviceLimitBar: { backgroundColor: theme.palette.grey[500], margin: '15px 0' },
  wrapper: {
    backgroundColor: theme.palette.background.lightgrey,
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(6),
    padding: theme.spacing(2),
    paddingTop: 0,
    '&>h5': { marginTop: 0, marginBottom: 0 },
    '.flexbox>span': { alignSelf: 'flex-end' },
    [`.${textFieldClasses.root}`]: { maxWidth: 200, minWidth: 100 },
    [`.${formControlLabelClasses.root}`]: { marginTop: theme.spacing() }
  }
}));

const numberFields = {
  compression: { key: 'compression', title: 'Compression level' },
  sourceWindow: { key: 'sourceWindow', title: 'Source window size' },
  inputWindow: { key: 'inputWindow', title: 'Input window size' },
  duplicatesWindow: { key: 'duplicatesWindow', title: 'Compression duplicates window' },
  instructionBuffer: { key: 'instructionBuffer', title: 'Instruction buffer size' }
};

const NumberInputLimited = ({ limit, onChange, value: propsValue, ...remainder }) => {
  const [value, setValue] = useState(propsValue);
  const debouncedValue = useDebounce(value, TIMEOUTS.oneSecond);
  const { default: defaultValue, max, min } = limit;

  useEffect(() => {
    if (debouncedValue === UNSET_LIMIT) {
      return;
    }
    const minimum = Math.max(min, debouncedValue);
    const allowedValue = Math.min(max ?? minimum, minimum);
    if (allowedValue !== debouncedValue) {
      setValue(allowedValue);
      return;
    }
    onChange(allowedValue);
  }, [debouncedValue]);

  const isInitialized = value !== UNSET_LIMIT;
  return (
    <TextField
      inputProps={{ step: 1, type: 'numeric', pattern: '[0-9]*', autoComplete: 'off' }}
      InputLabelProps={{ shrink: isInitialized }}
      error={(min || max) && isInitialized ? min > value || value > max : false}
      value={isInitialized ? value : ''}
      onChange={({ target: { value } }) => setValue(Number(value) || 0)}
      helperText={!isInitialized && defaultValue !== undefined ? `Defaults to: ${defaultValue}` : null}
      {...remainder}
    />
  );
};

export const ArtifactGenerationSettings = ({ deltaConfig, deltaEnabled, deltaLimits, getDeploymentsConfig, saveDeltaDeploymentsConfig }) => {
  const [timeoutValue, setTimeoutValue] = useState(UNSET_LIMIT);
  const [disableChecksum, setDisableChecksum] = useState(false);
  const [disableDecompression, setDisableDecompression] = useState(false);
  const [compression, setCompression] = useState(UNSET_LIMIT);
  const [sourceWindow, setSourceWindow] = useState(UNSET_LIMIT);
  const [inputWindow, setInputWindow] = useState(UNSET_LIMIT);
  const [duplicatesWindow, setDuplicatesWindow] = useState(UNSET_LIMIT);
  const [instructionBuffer, setInstructionBuffer] = useState(UNSET_LIMIT);
  const timer = useRef(null);

  const { classes } = useStyles();

  useEffect(() => {
    getDeploymentsConfig();
  }, []);

  useEffect(() => {
    const { timeout, duplicatesWindow, compression, disableChecksum, disableDecompression, inputWindow, instructionBuffer, sourceWindow } = deltaConfig;
    setDisableChecksum(disableChecksum);
    setDisableDecompression(disableDecompression);
    setCompression(compression);
    setTimeoutValue(timeout);
    setSourceWindow(sourceWindow);
    setInputWindow(inputWindow);
    setDuplicatesWindow(duplicatesWindow);
    setInstructionBuffer(instructionBuffer);
  }, [JSON.stringify(deltaConfig), JSON.stringify(deltaLimits)]);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () =>
        saveDeltaDeploymentsConfig({
          timeout: timeoutValue,
          duplicatesWindow,
          compression,
          disableChecksum,
          disableDecompression,
          inputWindow,
          instructionBuffer,
          sourceWindow
        }),
      TIMEOUTS.twoSeconds
    );
    return () => {
      clearTimeout(timer.current);
    };
  }, [compression, disableChecksum, disableDecompression, duplicatesWindow, inputWindow, instructionBuffer, sourceWindow, timeoutValue]);

  const numberInputs = useMemo(() => {
    return [
      { ...numberFields.compression, setter: setCompression, value: compression },
      { ...numberFields.sourceWindow, setter: setSourceWindow, value: sourceWindow, ...deltaLimits.sourceWindow },
      { ...numberFields.inputWindow, setter: setInputWindow, value: inputWindow, ...deltaLimits.inputWindow },
      { ...numberFields.duplicatesWindow, setter: setDuplicatesWindow, value: duplicatesWindow, ...deltaLimits.duplicatesWindow },
      { ...numberFields.instructionBuffer, setter: setInstructionBuffer, value: instructionBuffer, ...deltaLimits.instructionBuffer }
    ];
  }, [
    compression,
    setCompression,
    setSourceWindow,
    sourceWindow,
    inputWindow,
    setInputWindow,
    setDuplicatesWindow,
    duplicatesWindow,
    setInstructionBuffer,
    instructionBuffer,
    JSON.stringify(deltaLimits)
  ]);

  return (
    <div className={`flexbox column ${classes.wrapper}`}>
      <div className="flexbox center-aligned">
        <DeltaIcon />
        <h5 className="margin-left-small">Delta artifacts generation configuration</h5>
      </div>
      {deltaEnabled ? (
        <div className="margin-small margin-top-none">
          <div className="flexbox">
            <NumberInputLimited
              limit={{ min: deltaLimits.timeout.min, max: deltaLimits.timeout.max }}
              label="Timeout"
              onChange={setTimeoutValue}
              value={timeoutValue}
            />
            <span className="margin-left-small muted slightly-smaller">seconds</span>
          </div>
          <Typography className="margin-top-small" display="block" variant="caption">
            xDelta3 arguments
          </Typography>
          <div className="flexbox column margin-left">
            <FormControlLabel
              control={<Checkbox color="primary" checked={disableChecksum} onChange={({ target: { checked } }) => setDisableChecksum(checked)} size="small" />}
              label="Disable checksum"
            />
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={disableDecompression}
                  onChange={({ target: { checked } }) => setDisableDecompression(checked)}
                  size="small"
                />
              }
              label="Disable external decompression"
            />
            {numberInputs.map(({ default: defaultValue, key, setter, title, value, min = 0, max }) => (
              <NumberInputLimited key={key} limit={{ default: defaultValue, max, min }} label={title} value={value} onChange={setter} />
            ))}
          </div>
        </div>
      ) : (
        <InfoText>
          <InfoOutlinedIcon style={{ fontSize: '14px', margin: '0 4px 4px 0', verticalAlign: 'middle' }} />
          Automatic delta artifacts generation is not enabled in your account. If you want to start using this feature,{' '}
          <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
            contact our team
          </a>
          .
        </InfoText>
      )}
    </div>
  );
};

const actionCreators = { getDeploymentsConfig, saveDeltaDeploymentsConfig };

const mapStateToProps = state => {
  const { binaryDelta = {}, binaryDeltaLimits = {}, hasDelta } = state.deployments.config ?? {};
  return {
    deltaConfig: binaryDelta,
    deltaEnabled: hasDelta,
    deltaLimits: binaryDeltaLimits
  };
};

export default connect(mapStateToProps, actionCreators)(ArtifactGenerationSettings);
