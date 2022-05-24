import React, { useEffect, useState } from 'react';

import { InputAdornment, TextField } from '@mui/material';

import Loader from '../common/loader';
import { useDebounce } from '../../utils/debouncehook';

const Search = ({ isSearching, searchTerm, setSearchState }) => {
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearchTerm = useDebounce(searchValue, 700);

  useEffect(() => {
    setSearchState({ searchTerm: debouncedSearchTerm, page: 1 });
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!searchTerm) {
      setSearchValue(searchTerm);
    }
  }, [searchTerm]);

  const onSearchUpdated = ({ target: { value } }) => setSearchValue(value);

  const adornment = isSearching
    ? {
        endAdornment: <InputAdornment position="end">{<Loader show small style={{ marginTop: -10 }} />}</InputAdornment>
      }
    : {};
  return (
    <TextField
      className="search"
      InputProps={adornment}
      onChange={onSearchUpdated}
      placeholder="Search devices"
      value={searchValue}
      style={{ marginTop: 10 }}
    />
  );
};

export default Search;
