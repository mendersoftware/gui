import React from 'react';
import SearchInput from 'react-search-input';
import pluralize from 'pluralize';

// material ui
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import Loader from '../common/loader';

export default class ReleasesList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      sortCol: 'name',
      sortDown: true,
      searchTerm: null
    };
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term }); // needed to force re-render
  }

  render() {
    const self = this;

    const { loading, releases } = self.props;

    let filteredItems = releases;

    if (self.search) {
      var filters = ['Name', 'device_types_compatible'];
      filteredItems = releases.filter(self.search.filter(filters));
      self.props.onFilter(filteredItems);
    }

    return (
      <div className="repository-list">
        <div className="margin-bottom-small">
          <h4>Releases</h4>
          <SearchInput placeholder="Filter by name" className="search" ref={search => (self.search = search)} onChange={term => self.searchUpdated(term)} />
          {self.state.searchTerm ? <p className="muted">{`Filtered from ${releases.length} ${pluralize('Release', releases.length)}`}</p> : null}
          {!self.props.releases.length ? <p className="margin-top muted align-center margin-right">There are no Releases yet</p> : null }
        </div>
        {loading ? (
          <Loader show={loading} />
        ) : (
          <List>
            {filteredItems.map((release, index) => {
              const isSelected = release === self.props.selectedRelease;
              return (
                <ListItem button className={`repository-list-item ${isSelected ? 'active' : ''}`} key={index} onClick={() => self.props.onSelect(release)}>
                  <ListItemText>
                    <div className="flexbox">
                      <div className="inline-block">
                        <Typography variant="subtitle2">{release.Name}</Typography>
                        <Typography variant="body2" className="muted">{`${release.Artifacts.length} ${pluralize(
                          'Artifact',
                          release.Artifacts.length
                        )}`}</Typography>
                      </div>
                      <KeyboardArrowRightIcon className={isSelected ? null : 'indicator'} />
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
