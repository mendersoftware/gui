// Copyright 2022 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';

import { Search as SearchIcon } from '@mui/icons-material';
import { InputAdornment, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { TIMEOUTS } from '../../constants/appConstants';
import { useDebounce } from '../../utils/debouncehook';
import Loader from './loader';

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

// due to search not working reliably for single letter searches, only start at 2
const MINIMUM_SEARCH_LENGTH = 2;

const Search = ({ isSearching, onSearch, placeholder = 'Search devices', searchTerm, style = {} }) => {
  const [searchValue, setSearchValue] = useState('');
  const { classes } = useStyles();

  const debouncedSearchTerm = useDebounce(searchValue, TIMEOUTS.debounceDefault);

  useEffect(() => {
    if (debouncedSearchTerm.length < MINIMUM_SEARCH_LENGTH) {
      return;
    }
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  useEffect(() => {
    if (!searchTerm) {
      setSearchValue(searchTerm);
    }
  }, [searchTerm]);

  const onSearchUpdated = ({ target: { value } }) => setSearchValue(value);

  const onTriggerSearch = ({ key }) => {
    if (key === 'Enter' && (!searchValue || searchValue >= MINIMUM_SEARCH_LENGTH)) {
      onSearch(searchValue);
    }
  };

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
      onKeyPress={onTriggerSearch}
      placeholder={placeholder}
      size="small"
      style={style}
      value={searchValue}
    />
  );
};

export default Search;
