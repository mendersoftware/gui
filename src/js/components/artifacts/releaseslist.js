import React, { useState } from 'react';
import pluralize from 'pluralize';

// material ui
import { Button, List, ListItem, ListItemText, TextField, Typography } from '@material-ui/core';
import { KeyboardArrowRight as KeyboardArrowRightIcon, Sort as SortIcon } from '@material-ui/icons';
import { createFilterOptions } from '@material-ui/lab';

import Loader from '../common/loader';
import { customSort } from '../../helpers';

const filters = ['device_types_compatible', 'descriptions', 'Name'];

const filter = createFilterOptions({ stringify: option => filters.map(item => option[item]).join(' ') });

export const ReleasesList = ({ loading, onFilter, onSelect, releases, selectedRelease }) => {
  const [sortDown, setSortDown] = useState(true);
  const [filteredReleases, setFilteredReleases] = useState();

  const searchUpdated = searchTerm => {
    const filteredReleases = filter(releases, { inputValue: searchTerm });
    onFilter(filteredReleases);
    setFilteredReleases(filteredReleases);
  };

  const sortedReleases = (filteredReleases || releases).sort(customSort(sortDown, 'Name'));

  return (
    <div className="repository-list flexbox column" style={{ alignItems: 'flex-start' }}>
      <div className="flexbox" style={{ alignItems: 'center' }}>
        <h3>Releases</h3>
        <TextField placeholder="Filter" className="search" onChange={e => searchUpdated(e.target.value)} style={{ marginLeft: 30, marginTop: 0 }} />
      </div>
      {releases.length !== sortedReleases.length && <p className="muted">{`Filtered from ${releases.length} ${pluralize('Release', releases.length)}`}</p>}
      <Button
        className="muted"
        onClick={() => setSortDown(!sortDown)}
        endIcon={<SortIcon className={`sortIcon ${sortDown.toString()}`} />}
        style={{ textTransform: 'none' }}
      >
        Name
      </Button>
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
