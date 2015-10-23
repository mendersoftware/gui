var React = require('react');

// material ui
var mui = require('material-ui');
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var LeftNav = mui.LeftNav;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;


var Filters = React.createClass({
  getInitialState: function() {
    return {
      isDocked: false
    };
  },
  _updateFilterKey: function (index, e) {
    var filterArray = this.props.filters;
    filterArray[index].key = e.target.value;
    filterArray[index].value = '';
    this.setState({filters: filterArray});
  },
  _updateFilterValue: function (index, e) {
    var filterArray = this.props.filters;
    filterArray[index].value = e.target.value;
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
    this.refs.filterNav.toggle();
    this.setState({
      isDocked: !this.state.isDocked,
    });
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
        marginRight: "-6"
      },
    }
    var attributes = [];
    for (key in this.props.attributes) {
      var tmp = { payload:key, text: this.props.attributes[key] };
      attributes.push(tmp);
    }
    var menuItems = [{text:'Disabled', disabled:true}];
    var filters = this.props.filters.map(function(item, index) {
      return (
        <div className="filterPair" key={index}>
          <IconButton
            iconClassName="material-icons"
            className="remove-filter"
            style={{position:"absolute"}}
            onClick={this._removeFilter.bind(null, index)}
            disabled={!this.props.filters[0].key}>
            remove_circle
          </IconButton>
          <SelectField
            style={{width:"100%"}}
            value={item.key}
            onChange={this._updateFilterKey.bind(null, index)}
            hintText="Filter by"
            menuItems={attributes} />
          <TextField
            style={{width:"100%", marginTop:"-10"}}
            value={item.value}
            hintText="Value"
            disabled={!item.key}
            onChange={this._updateFilterValue.bind(null, index)} />
        </div>
      )
    }, this);
    var filterNav = (
      <div className="filterWrapper">
        <div>
          <FlatButton onClick={this._toggleNav} label="Hide filters" />
        </div>
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
          docked={this.state.isDocked}
          openRight={true}
          menuItems={[]}
          header={filterNav}
          style={{padding: "10px 20px", top:"58", overflowY:"auto"}} />

        <div style={{width:"100%", position:"relative"}}>
          <FlatButton style={{position:"absolute",right:"30", top:"-40"}} onClick={this._toggleNav} label={this.state.isDocked ? "Hide filters" : "Show filters"} />
        </div>
      </div>
    );
  }
});

module.exports = Filters;