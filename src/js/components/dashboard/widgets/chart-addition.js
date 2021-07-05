import React, { useState } from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { defaultReports } from '../software-distribution';

const styles = {
  additionButtonWrapper: { cursor: 'pointer', height: '100%' },
  additionButton: { fontSize: '1rem', cursor: 'pointer' },
  button: { marginRight: 15, marginBottom: 15 },
  buttonWrapper: { alignSelf: 'flex-end' },
  formWrapper: { flexGrow: 1 }
};

export const ChartAdditionWidget = ({ groups, onAdditionClick, style }) => {
  const [adding, setAdding] = useState(false);
  const [selection, setSelection] = useState('');

  const addCurrentSelection = () => {
    onAdditionClick({ ...defaultReports[0], group: typeof selection === 'string' ? selection : null });
    setAdding(false);
    setSelection('');
  };

  return (
    <div className="margin-right margin-bottom widget chart-widget" style={style}>
      {adding ? (
        <>
          <div className="flexbox centered" style={styles.formWrapper}>
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
          <div className="flexbox" style={styles.buttonWrapper}>
            <Button onClick={() => setAdding(false)} style={styles.button}>
              Cancel
            </Button>
            <Button variant="contained" disabled={!selection} onClick={addCurrentSelection} style={styles.button}>
              Save
            </Button>
          </div>
        </>
      ) : (
        <div className="flexbox centered" style={styles.additionButtonWrapper} onClick={() => setAdding(true)}>
          <div className="flexbox centered muted">
            <AddIcon />
            <span style={styles.additionButton}>Add a chart</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartAdditionWidget;
