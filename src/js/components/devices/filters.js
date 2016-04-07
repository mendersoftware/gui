import React from 'react';

// material ui
var mui = require('material-ui');
var SelectField = mui.SelectField;
var MenuItem = mui.MenuItem;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var LeftNav = mui.LeftNav;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;


var Filters = React.createClass({
  getInitialState: function() {
    return {
      showFilters: false
    };
  },
  _updateFilterKey: function (i, event, index, value) {
    var filterArray = this.props.filters;
    filterArray[i] = {key:value, value:''};
    this.setState({filters: filterArray});
  },
  _updateFilterValue: function (index, event) {
    var filterArray = this.props.filters;
    filterArray[index].value = event.target.value;
    this.props.onFilterChange(filterArray);
  },
  _addFilter: function() {
    var filterArray = this.props.filters;
    filterArray.push({key:'', value:''});
    this.props.onFilterChange(filterArray);
  },
  _removeFilter: function(index) {
    var filterArray = this.props.filters;
    if (filterArray.length>1) {
      filterArray.splice(index,1);
    }
    else {
      filterArray[0].value = '';
    }
    this.props.onFilterChange(filterArray);
  },
  _toggleNav: function() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  },
  _clearFilters: function() {
    this.props.onFilterChange([{}]);
  },
  render: function() {
    var styles = {
      exampleFlatButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6",
        color:"#679BA5"
      },
      removeButton: {
        position: "absolute",
        right: "-22",
        top: "-22",
        color: "#679BA5"
      }
    }
    var attributes = [];
    for (var key in this.props.attributes) {
      var i = Object.keys(this.props.attributes).indexOf(key);
      var tmp = <MenuItem value={key} key={i} primaryText={this.props.attributes[key]} />
      attributes.push(tmp);
    }
    var filterCount = 0;
    var filters = this.props.filters.map(function(item, index) {
      item.value ? filterCount++ : filterCount;
      return (
        <div className="filterPair" key={index}>
          <IconButton
            iconClassName="material-icons"
            style={styles.removeButton}
            onClick={this._removeFilter.bind(null, index)}
            disabled={!this.props.filters[0].key}
            className={this.props.filters[0].value ? "remove-icon" : "hidden"}>
            remove_circle
          </IconButton>
          <SelectField
            fullWidth={true}
            value={item.key}
            autoWidth={true}
            onChange={this._updateFilterKey.bind(null, index)}
            hintText="Filter by"
          >
            {attributes} 
          </SelectField>
          <TextField
            style={{marginTop:"-10"}}
            value={item.value}
            hintText="Value"
            fullWidth={true}
            disabled={!item.key}
            errorStyle={{color: "rgb(171, 16, 0)"}}
            onChange={this._updateFilterValue.bind(null, index)} />
        </div>
      )
    }, this);
    var filterNav = (
      <div className="slider" style={{height:"100%"}}>
        <IconButton className="closeSlider" iconStyle={{fontSize:"16px"}} onClick={this._toggleNav} style={{borderRadius:"30px", width:"40px", height:"40", position:"absolute", left:"-18px", backgroundColor:"rgba(255,255,255,1)"}}>
          <FontIcon className="material-icons">close</FontIcon>
        </IconButton>
        <p className="align-right margin-bottom-small"><a onClick={this._clearFilters}>Clear all filters</a></p>
        <div>
        {filters}
        </div>
        <FlatButton disabled={!this.props.filters[this.props.filters.length-1].value} onClick={this._addFilter} label="Add filter" secondary={true}>
          <FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">add_circle</FontIcon>
        </FlatButton>
      </div>
    );
    return (
      <div>
        <LeftNav 
          ref="filterNav"
          open={this.state.showFilters}
          onRequestChange={this._toggleNav}
          docked={false}
          openRight={true}
          overlayStyle={{top:"105"}}
          containerStyle={this.state.showFilters ? {overflow:"visible", top:"105"} : {overflow:"hidden", top:"105"}}
        >
          {filterNav}
        </LeftNav>

        <div style={{width:"100%", position:"relative"}}>
          <FlatButton style={{position:"absolute",right:"0"}} secondary={true} onClick={this._toggleNav} label={filterCount>0 ? "Filters ("+filterCount+")" : "Filters"}>
              <FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">filter_list</FontIcon>
          </FlatButton>
        </div>
      </div>
    );
  }
});

module.exports = Filters;