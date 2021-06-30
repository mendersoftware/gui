import React, { useState } from 'react';
import pluralize from 'pluralize';

// material ui
import { Button, ButtonGroup, List, ListItem, ListItemText, Menu, MenuItem, TextField, Typography } from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon, KeyboardArrowRight as KeyboardArrowRightIcon, Sort as SortIcon } from '@material-ui/icons';
import { createFilterOptions } from '@material-ui/lab';

import Loader from '../common/loader';
import { customSort } from '../../helpers';

const filters = ['device_types_compatible', 'descriptions', 'Name'];

const filter = createFilterOptions({ stringify: option => filters.map(item => option[item]).join(' ') });

const sortingOptions = [
  { title: 'Name', value: 'Name' },
  { title: 'Date modified', value: 'latestModified' }
];

const buttonStyle = { border: 'none', textTransform: 'none' };
const heightEnsuringStyle = { minHeight: 'min-content' };

export const ReleasesList = ({ loading, onFilter, onSelect, releases, selectedRelease }) => {
  const [anchorEl, setAnchorEl] = useState();
  const [filteredReleases, setFilteredReleases] = useState();
  const [sortDown, setSortDown] = useState(true);
  const [selectedSortOption, setSelectedSortOption] = useState(0);

  const searchUpdated = searchTerm => {
    const filteredReleases = filter(releases, { inputValue: searchTerm });
    onFilter(filteredReleases);
    setFilteredReleases(filteredReleases);
  };

  const handleToggle = event => {
    const anchor = anchorEl ? null : event?.currentTarget.parentElement;
    setAnchorEl(anchor);
  };

  const handleSelection = index => {
    setSelectedSortOption(index);
    handleToggle();
  };

  const sortedReleases = (filteredReleases || releases).sort(customSort(sortDown, sortingOptions[selectedSortOption].value));

  return (
    <div className="repository-list flexbox column overflow-hidden">
      <div className="flexbox center-aligned" style={heightEnsuringStyle}>
        <h3>Releases</h3>
        <TextField placeholder="Filter" className="search" onChange={e => searchUpdated(e.target.value)} style={{ marginLeft: 30, marginTop: 0 }} />
      </div>
      {releases.length !== sortedReleases.length && (
        <p className="muted" style={heightEnsuringStyle}>{`Filtered from ${releases.length} ${pluralize('Release', releases.length)}`}</p>
      )}
      <ButtonGroup className="muted" size="small" style={heightEnsuringStyle}>
        <Button onClick={() => setSortDown(!sortDown)} endIcon={<SortIcon className={`sortIcon ${sortDown.toString()}`} />} style={buttonStyle}>
          {sortingOptions[selectedSortOption].title}
        </Button>
        <Button size="small" onClick={handleToggle} style={buttonStyle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Menu id="sorting-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleToggle} variant="menu">
        {sortingOptions.map((option, index) => (
          <MenuItem key={`sorting-option-${option.value}`} onClick={() => handleSelection(index)} style={buttonStyle}>
            {option.title}
          </MenuItem>
        ))}
      </Menu>

      {!releases.length ? <p className="margin-top muted align-center margin-right">There are no Releases yet</p> : null}
      {loading ? (
        <Loader show={loading} />
      ) : (
        <List>
          {sortedReleases.map((release, index) => {
            var isSelected = index === 0;
            isSelected = selectedRelease ? release.Name === selectedRelease.Name : isSelected;
            return (
              <ListItem button className={`repository-list-item ${isSelected ? 'active' : ''}`} key={index} onClick={() => onSelect(release)}>
                <ListItemText>
                  <div className="flexbox">
                    <div className="inline-block">
                      <Typography variant="subtitle2">{release.Name}</Typography>
                      <Typography variant="body2" className="muted">{`${release.Artifacts.length} ${pluralize(
                        'Artifact',
                        release.Artifacts.length
                      )}`}</Typography>
                    </div>
                    <KeyboardArrowRightIcon className={isSelected ? '' : 'indicator'} />
                  </div>
                </ListItemText>
              </ListItem>
            );
          })}
        </List>
      )}
    </div>
  );
};

export default ReleasesList;
