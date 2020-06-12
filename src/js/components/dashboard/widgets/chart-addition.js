import React from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import { defaultReports } from '../software-distribution';

export default class ChartAdditionWidget extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      adding: false,
      selection: ''
    };
  }

  addCurrentSelection(selection) {
    this.props.onAdditionClick({ ...defaultReports[0], group: typeof selection === 'string' ? selection : null });
    this.setState({ adding: false, selection: '' });
  }

  render() {
    const self = this;
    const { groups, style } = self.props;
    const { adding, selection } = self.state;
    return (
      <div className="margin-right margin-bottom widget chart-widget" style={style}>
        {adding ? (
          <>
            <div className="flexbox centered" style={{ flexGrow: 1 }}>
              <FormControl>
                <InputLabel id="group-select-label">Device group</InputLabel>
                <Select labelId="group-select-label" value={selection} onChange={e => self.setState({ selection: e.target.value })}>
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
            <div className="flexbox" style={{ alignSelf: 'flex-end' }}>
              <Button onClick={() => self.setState({ adding: false })} style={{ marginRight: 15, marginBottom: 15 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!selection}
                onClick={() => self.addCurrentSelection(selection)}
                style={{ marginRight: 15, marginBottom: 15 }}
              >
                Save
              </Button>
            </div>
          </>
        ) : (
          <div className="flexbox centered" style={{ cursor: 'pointer', height: '100%' }} onClick={() => self.setState({ adding: true })}>
            <div className="flexbox centered muted">
              <AddIcon />
              <span style={{ fontSize: '1rem', cursor: 'pointer' }}>Add a chart</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
