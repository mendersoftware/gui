import React, { useState } from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import { defaultReports } from '../software-distribution';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  additionButton: { fontSize: '1rem', cursor: 'pointer' },
  button: { marginRight: theme.spacing(2), marginBottom: theme.spacing(2) },
  buttonWrapper: { display: 'flex', alignSelf: 'flex-end' },
  formWrapper: { flexGrow: 1 }
}));

export const ChartAdditionWidget = ({ groups, onAdditionClick, style }) => {
  const [adding, setAdding] = useState(false);
  const [selection, setSelection] = useState('');
  const { classes } = useStyles();

  const addCurrentSelection = () => {
    onAdditionClick({ ...defaultReports[0], group: typeof selection === 'string' ? selection : null });
    setAdding(false);
    setSelection('');
  };

  return (
    <div className="widget chart-widget" style={style}>
      {adding ? (
        <>
          <div className={`flexbox centered ${classes.formWrapper}`}>
            <FormControl>
              <InputLabel id="group-select-label">Device group</InputLabel>
              <Select labelId="group-select-label" value={selection} onChange={e => setSelection(e.target.value)}>
                <MenuItem value={true}>
                  <em>All Devices</em>
                </MenuItem>
                {Object.keys(groups).map(group => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className={classes.buttonWrapper}>
            <Button className={classes.button} onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button className={classes.button} variant="contained" disabled={!selection} onClick={addCurrentSelection}>
              Save
            </Button>
          </div>
        </>
      ) : (
        <>
          <div></div>
          <div className={`flexbox centered muted ${classes.additionButton}`} onClick={() => setAdding(true)}>
            <AddIcon />
            <span className={classes.additionButton}>Add a chart</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartAdditionWidget;
