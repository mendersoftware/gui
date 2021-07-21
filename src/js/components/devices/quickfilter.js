import React, { useEffect, useState } from 'react';

import { MenuItem, Select, TextField } from '@material-ui/core';

let timer;

export const QuickFilter = ({ attributes, attributeSetting = 'name', filters, onChange }) => {
  const [filterValue, setFilterValue] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState(attributeSetting);

  useEffect(() => {
    setSelectedAttribute(attributeSetting);
  }, [attributeSetting]);

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

  return (
    <div>
      Quick find Device
      <Select className="margin-left-small" disableUnderline onChange={onSelectionChange} value={selectedAttribute} style={{ fontSize: 13 }}>
        {attributes.map(attribute => (
          <MenuItem key={attribute.key} value={attribute.key}>
            {attribute.value}
          </MenuItem>
        ))}
      </Select>
      <TextField placeholder="Filter" className="search" value={filterValue} onChange={onSearchChange} style={{ marginLeft: 30, marginTop: 0 }} />
    </div>
  );
};

export default QuickFilter;
