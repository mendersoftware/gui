import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import FilterListIcon from '@material-ui/icons/FilterList';

export default class Filters extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFilters: false
    };
  }
  _updateFilterKey(i, event, index, value) {
    var filterArray = this.props.filters;
    filterArray[i] = { key: value, value: '' };
    this.setState({ filters: filterArray });
  }
  _updateFilterValue(index, event) {
    var filterArray = this.props.filters;
    filterArray[index].value = event.target.value;
    this.props.onFilterChange(filterArray);
  }
  _addFilter() {
    var filterArray = this.props.filters;
    filterArray.push({ key: '', value: '' });
    this.props.onFilterChange(filterArray);
  }
  _removeFilter(index) {
    var filterArray = this.props.filters;
    if (filterArray.length > 1) {
      filterArray.splice(index, 1);
    } else {
      filterArray = [];
    }
    this.props.onFilterChange(filterArray);
  }
  _toggleNav() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }
  _closeNav() {
    if (!this.state.showFilters) {
      return;
    }
    this.setState({
      showFilters: false
    });
  }
  _clearFilters() {
    this.props.onFilterChange([]);
  }
  render() {
    const self = this;
    var attributes = Object.entries(this.props.attributes).reduce(
      (accu, item, index) => {
        accu.push(
          <MenuItem component={Link} to={item[0]} key={index}>
            {item[1]}
          </MenuItem>
        );
        return accu;
      },
      [
        <MenuItem key="filter-placeholder" disabled>
          Filter by
        </MenuItem>
      ]
    );

    var filterCount = 0;
    var fromProps = self.props.filters.length ? self.props.filters : [{ key: '', value: '' }];
    var filters = fromProps.map((item, index) => {
      filterCount = item.value ? filterCount + 1 : filterCount;
      return (
        <ListItem className="filterPair" key={index}>
          <ListItemText>
            <div>
              <IconButton
                className={`material-icons ${fromProps[0].value ? 'remove-icon' : 'hidden'}`}
                onClick={() => self._removeFilter(index)}
                disabled={!fromProps[0].key}
              >
                remove_circle
              </IconButton>
              <Select fullWidth={true} value={item.key} autoWidth={true} onChange={() => self._updateFilterKey(index)}>
                {attributes}
              </Select>
            </div>
            <TextField
              style={{ marginTop: '-10px' }}
              value={item.value || ''}
              placeholder="Value"
              fullWidth={true}
              disabled={!item.key}
              errorStyle={{ color: 'rgb(171, 16, 0)' }}
              onChange={() => self._updateFilterValue(index)}
            />
          </ListItemText>
        </ListItem>
      );
    });

    const drawerStyles = this.state.showFilters ? { overflow: 'visible', top: '57px' } : { overflow: 'hidden', top: '57px' };
    return (
      <div style={{ position: 'relative' }}>
        <Button style={{ position: 'absolute', right: '0' }} color="secondary" onClick={() => this._toggleNav()}>
          <FilterListIcon />
          {filterCount > 0 ? `Filters (${filterCount})` : 'Filters'}
        </Button>
        <Drawer
          open={this.state.showFilters}
          docked="false"
          anchor="right"
          opensecondary="true"
          PaperProps={{ style: drawerStyles }}
          BackdropProps={{ style: drawerStyles }}
          onClose={() => this._closeNav()}
        >
          <IconButton
            className="closeSlider"
            onClick={() => this._toggleNav()}
            style={{ position: 'absolute', left: '-25px', background: 'white', top: '20px' }}
          >
            <CloseIcon />
          </IconButton>
          <p className="align-right margin-bottom-small">
            <a onClick={() => this._clearFilters()}>Clear all filters</a>
          </p>
          <List>{filters}</List>
          {this.props.isHosted ? (
            <Button disabled={!filterCount} onClick={() => this._addFilter()} color="secondary">
              <AddCircleIcon />
              Add filter
            </Button>
          ) : null}
        </Drawer>
      </div>
    );
  }
}
