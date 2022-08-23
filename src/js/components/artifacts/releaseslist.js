import React, { useState, useRef, useEffect } from 'react';
import pluralize from 'pluralize';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';

// material ui
import { Button, ButtonGroup, ListItem, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon, KeyboardArrowRight as KeyboardArrowRightIcon, Sort as SortIcon } from '@mui/icons-material';

import Loader from '../common/loader';
import { SORTING_OPTIONS } from '../../constants/appConstants';
import { defaultVisibleSection } from '../../constants/releaseConstants';
import { useDebounce } from '../../utils/debouncehook';
import useWindowSize from '../../utils/resizehook';
import Search from '../common/search';

const sortingOptions = {
  Name: 'Name',
  modified: 'Date modified'
};

const buttonStyle = { border: 'none', textTransform: 'none' };

const ReleaseListItem = ({ data, index, style }) => {
  const { onSelect, releases, selectedRelease } = data;
  const release = releases[index];
  let isSelected = index === 0;
  isSelected = release && selectedRelease ? release.Name === selectedRelease.Name : isSelected;
  return (
    <ListItem
      button
      selected={isSelected}
      className="repository-list-item"
      onClick={() => onSelect(release)}
      style={style}
      secondaryAction={<KeyboardArrowRightIcon className={isSelected ? '' : 'indicator'} />}
    >
      {!release?.Name ? (
        <Loader show />
      ) : (
        <ListItemText>
          <Typography variant="subtitle2">{release.Name}</Typography>
          <Typography variant="body2" className="muted">{`${release.Artifacts.length} ${pluralize('Artifact', release.Artifacts.length)}`}</Typography>
        </ListItemText>
      )}
    </ListItem>
  );
};

const listItemSize = 63;

export const ReleasesList = ({ loading, onSelect, releasesListState, releases, selectedRelease, setReleasesListState }) => {
  const [anchorEl, setAnchorEl] = useState();
  const [visibleSection, setVisibleSection] = useState({ ...defaultVisibleSection });
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const outerRef = useRef();
  const [currentVisibleSection, setCurrentVisibleSection] = useState({ ...defaultVisibleSection });

  const size = useWindowSize();

  const { searchTerm, sort = {}, searchTotal, total } = releasesListState;
  const { key: attribute, direction } = sort;

  const debouncedVisibleSection = useDebounce(visibleSection, 300);

  useEffect(() => {
    setReleasesListState({ visibleSection: debouncedVisibleSection });
  }, [refreshTrigger, debouncedVisibleSection]);

  useEffect(() => {
    setCurrentVisibleSection(visibleSection);
  }, [size.height, outerRef.current]);

  const onSetReleaseListState = changedState =>
    setReleasesListState({ page: 1, releaseIds: [], visibleSection: { ...currentVisibleSection }, ...changedState });

  const searchUpdated = searchTerm => onSetReleaseListState({ searchTerm, searchAttribute: undefined });

  const handleToggle = event => {
    const anchor = anchorEl ? null : event?.currentTarget.parentElement;
    setAnchorEl(anchor);
  };

  const handleSortSelection = ({ target }) => {
    onSetReleaseListState({ sort: { key: target.getAttribute('value') } });
    handleToggle();
  };

  const handleSortDirection = () => {
    const changedDirection = direction === SORTING_OPTIONS.asc ? SORTING_OPTIONS.desc : SORTING_OPTIONS.asc;
    onSetReleaseListState({ sort: { direction: changedDirection } });
    handleToggle();
  };

  const loadMoreItems = () => setRefreshTrigger(!refreshTrigger);

  const onScroll = ({ scrollOffset }, height) => {
    if (!outerRef.current) {
      return;
    }
    const start = Math.max(1, Math.round(scrollOffset / listItemSize));
    const end = start + Math.round(height / listItemSize);
    setVisibleSection({ start, end });
  };

  const isItemLoaded = index => !!releases[index]?.Name;

  const itemCount = (searchTerm ? searchTotal : total) || releases.length;
  return (
    <div className="repository-list flexbox column">
      <div className="flexbox center-aligned">
        <h3>Releases</h3>
        <Search onSearch={searchUpdated} searchTerm={searchTerm} placeholder="Filter" style={{ marginLeft: 30, marginTop: 0 }} />
      </div>
      {searchTerm && searchTotal !== total ? <p className="muted">{`Filtered from ${total} ${pluralize('Release', total)}`}</p> : <div />}
      <ButtonGroup className="muted" size="small" variant="text">
        <Button onClick={handleSortDirection} endIcon={<SortIcon className={`sortIcon ${direction === SORTING_OPTIONS.desc}`} />} style={buttonStyle}>
          {sortingOptions[attribute]}
        </Button>
        <Button size="small" onClick={handleToggle} style={buttonStyle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Menu id="sorting-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleToggle} variant="menu">
        {Object.entries(sortingOptions).map(([value, title]) => (
          <MenuItem key={`sorting-option-${value}`} onClick={handleSortSelection} style={buttonStyle} value={value}>
            {title}
          </MenuItem>
        ))}
      </Menu>

      {loading ? (
        <Loader show={loading} />
      ) : !itemCount ? (
        <p className="margin-top muted align-center margin-right">There are no Releases {!searchTotal && total ? `for ${searchTerm}` : 'yet'}</p>
      ) : (
        // the wrapping <div /> is needed to allow the AutoSizer to properly autosize the release list,
        // otherwise it would traverse to the closest relative containing div, resulting in a false size/ potentially hidden list items
        <div className="relative">
          <AutoSizer>
            {({ height, width }) => (
              <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                {({ onItemsRendered, ref }) => (
                  <FixedSizeList
                    outerRef={outerRef}
                    height={height}
                    width={width}
                    itemSize={listItemSize}
                    itemCount={itemCount}
                    itemData={{ onSelect, releases, selectedRelease }}
                    overscanCount={5}
                    onItemsRendered={onItemsRendered}
                    onScroll={e => onScroll(e, height)}
                    ref={ref}
                  >
                    {ReleaseListItem}
                  </FixedSizeList>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </div>
      )}
    </div>
  );
};

export default ReleasesList;
