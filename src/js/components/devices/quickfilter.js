import React, { useEffect, useState } from 'react';

import { MenuItem, Select, TextField } from '@mui/material';

import MenderTooltip from '../common/mendertooltip';

let timer;

const filterNotifications = {
  name: 'This will only apply to devices that have a device name configured'
};

export const QuickFilter = ({ attributes, attributeSetting = { attribute: 'name', scope: 'tags' }, filters, onChange }) => {
  const [filterValue, setFilterValue] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState(attributeSetting.attribute);

  useEffect(() => {
    setSelectedAttribute(attributeSetting.attribute);
  }, [attributeSetting.attribute]);

  useEffect(() => {
    if (!(filterValue && selectedAttribute)) {
      return;
    }
    clearTimeout(timer);
    const selectedScope = attributes.find(attribute => attribute.key === selectedAttribute)?.scope;
    timer = setTimeout(() => onChange(filterValue, selectedAttribute, selectedScope), 700);
    return () => {
      clearTimeout(timer);
    };
  }, [selectedAttribute, filterValue]);

  useEffect(() => {
    if (!filters.length || !filters.some(filter => filter.key === selectedAttribute && filter.value === filterValue)) {
      setFilterValue('');
    }
  }, [filters]);

  const onSearchChange = ({ target: { value } }) => {
    setFilterValue(value);
    if (!value) {
      onChange();
    }
  };

  const onSelectionChange = ({ target: { value } }) => setSelectedAttribute(value);

  const input = <TextField placeholder="Filter" className="search" value={filterValue} onChange={onSearchChange} style={{ marginLeft: 30, marginTop: 0 }} />;

  const filterInput = filterNotifications[selectedAttribute] ? (
    <MenderTooltip arrow title={filterNotifications[selectedAttribute]}>
      {input}
    </MenderTooltip>
  ) : (
    input
  );

  return (
    <div>
      Quick find Device
      <Select className="margin-left-small" inputProps={{ underline: 'false' }} onChange={onSelectionChange} value={selectedAttribute} style={{ fontSize: 13 }}>
        {attributes.map(attribute => (
          <MenuItem key={attribute.key} value={attribute.key}>
            {attribute.value}
          </MenuItem>
        ))}
      </Select>
      {filterInput}
    </div>
  );
};

export default QuickFilter;
