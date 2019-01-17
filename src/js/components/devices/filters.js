import React from 'react';

// material ui
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

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
  _clearFilters() {
    this.props.onFilterChange([]);
  }
  render() {
    var styles = {
      exampleFlatButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: '-6px',
        color: '#679BA5'
      },
      removeButton: {
        position: 'absolute',
        right: '-22px',
        top: '-22px',
        color: '#679BA5'
      }
    };
    var attributes = [];
    for (var key in this.props.attributes) {
      var i = Object.keys(this.props.attributes).indexOf(key);
      var tmp = <MenuItem value={key} key={i} primaryText={this.props.attributes[key]} />;
      attributes.push(tmp);
    }
    var filterCount = 0;
    var fromProps = this.props.filters.length ? this.props.filters : [{ key: '', value: '' }];
    var filters = fromProps.map(function(item, index) {
      item.value ? filterCount++ : filterCount;
      return (
        <div className="filterPair" key={index}>
          <IconButton
            iconClassName="material-icons"
            style={styles.removeButton}
            onClick={() => this._removeFilter(index)}
            disabled={!fromProps[0].key}
            className={fromProps[0].value ? 'remove-icon' : 'hidden'}
          >
            remove_circle
          </IconButton>
          <SelectField fullWidth={true} value={item.key} autoWidth={true} onChange={() => this._updateFilterKey(index)} hintText="Filter by">
            {attributes}
          </SelectField>
          <TextField
            style={{ marginTop: '-10px' }}
            value={item.value || ''}
            hintText="Value"
            fullWidth={true}
            disabled={!item.key}
            errorStyle={{ color: 'rgb(171, 16, 0)' }}
            onChange={() => this._updateFilterValue(index)}
          />
        </div>
      );
    }, this);
    var filterNav = (
      <div className="slider" style={{ height: '100%' }}>
        <IconButton
          className="closeSlider"
          iconStyle={{ fontSize: '16px' }}
          onClick={() => this._toggleNav()}
          style={{ borderRadius: '30px', width: '40px', height: '40px', position: 'absolute', left: '-18px', backgroundColor: 'rgba(255,255,255,1)' }}
        >
          <FontIcon className="material-icons">close</FontIcon>
        </IconButton>
        <p className="align-right margin-bottom-small">
          <a onClick={() => this._clearFilters()}>Clear all filters</a>
        </p>
        <div>{filters}</div>
        {this.props.isHosted ? (
          <FlatButton disabled={!filterCount} onClick={() => this._addFilter()} label="Add filter" secondary={true}>
            <FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">
              add_circle
            </FontIcon>
          </FlatButton>
        ) : null}
      </div>
    );
    return (
      <div>
        <Drawer
          ref="filterNav"
          open={this.state.showFilters}
          onRequestChange={() => this._toggleNav()}
          docked={false}
          openSecondary={true}
          overlayStyle={{ top: '57px', backgroundColor: 'rgba(0, 0, 0, 0.24)' }}
          containerStyle={this.state.showFilters ? { overflow: 'visible', top: '57px' } : { overflow: 'hidden', top: '57px' }}
        >
          {filterNav}
        </Drawer>

        <div style={{ width: '100%', position: 'relative' }}>
          <FlatButton
            style={{ position: 'absolute', right: '0' }}
            secondary={true}
            onClick={() => this._toggleNav()}
            label={filterCount > 0 ? `Filters (${filterCount})` : 'Filters'}
          >
            <FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">
              filter_list
            </FontIcon>
          </FlatButton>
        </div>
      </div>
    );
  }
}
