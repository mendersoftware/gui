import React, { useEffect, useState } from 'react';

import { InputAdornment, TextField } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import Loader from './loader';
import { useDebounce } from '../../utils/debouncehook';

const useStyles = makeStyles()(() => ({
  root: {
    input: {
      fontSize: '13px'
    }
  }
}));

const endAdornment = (
  <InputAdornment position="end">
    <Loader show small style={{ marginTop: -10 }} />
  </InputAdornment>
);

const Search = ({ isSearching, onSearch, placeholder = 'Search devices', searchTerm, style = {} }) => {
  const [searchValue, setSearchValue] = useState('');
  const { classes } = useStyles();

  const debouncedSearchTerm = useDebounce(searchValue, 700);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!searchTerm) {
      setSearchValue(searchTerm);
    }
  }, [searchTerm]);

  const onSearchUpdated = ({ target: { value } }) => setSearchValue(value);

  const adornment = isSearching ? { endAdornment } : {};
  return (
    <TextField
      className={classes.root}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="disabled" fontSize="size" />
          </InputAdornment>
        ),
        ...adornment
      }}
      onChange={onSearchUpdated}
      placeholder={placeholder}
      size="small"
      style={style}
      value={searchValue}
    />
  );
};

export default Search;
