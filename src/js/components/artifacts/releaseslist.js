import React from 'react';
import SearchInput from 'react-search-input';
import pluralize from 'pluralize';

// material ui
import { Button, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import { KeyboardArrowRight as KeyboardArrowRightIcon, Sort as SortIcon } from '@material-ui/icons';

import Loader from '../common/loader';
import { customSort } from '../../helpers';

export default class ReleasesList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      searchTerm: null,
      sortDown: true
    };
  }

  searchUpdated(term) {
    const self = this;
    if (self.search) {
      var filters = ['Name', 'device_types_compatible'];
      let filteredItems = self.props.releases;
      filteredItems = self.props.releases.filter(self.search.filter(filters));
      self.props.onFilter(filteredItems);
      self.setState({ searchTerm: term, filteredReleases: filteredItems });
    }
  }

  render() {
    const self = this;
    const { loading, onSelect, releases, selectedRelease } = self.props;
    const { sortDown } = self.state;

    const filteredReleases = (self.state.filteredReleases || releases).sort(customSort(sortDown, 'Name'));

    return (
      <div className="repository-list">
        <div className="flexbox" style={{ alignItems: 'center' }}>
          <h3>Releases</h3>
          <SearchInput
            placeholder="Filter by name"
            className="search margin-left"
            ref={search => (self.search = search)}
            onChange={term => self.searchUpdated(term)}
          />
        </div>
        {self.state.searchTerm ? <p className="muted">{`Filtered from ${releases.length} ${pluralize('Release', releases.length)}`}</p> : null}
        <Button
          className="muted"
          onClick={() => self.setState({ sortDown: !sortDown })}
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
            {filteredReleases.map((release, index) => {
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
  }
}
