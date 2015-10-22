var React = require('react');

// material ui
var mui = require('material-ui');
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var LeftNav = mui.LeftNav;
var FontIcon = mui.FontIcon;


var Filters = React.createClass({
  getInitialState: function() {
    return {
      filters: this.props.filters,
      isDocked: false
    };
  },
  _updateFilterKey: function (index, e) {
    var filterArray = this.state.filters;
    filterArray[index].key = e.target.value;
    this.setState({filters: filterArray});
  },
  _updateFilterValue: function (index, e) {
    var filterArray = this.state.filters;
    filterArray[index].value = e.target.value;
    this.setState({filters: filterArray});
  },
  _addFilter: function() {
    var filterArray = this.state.filters;
    filterArray.push({key:'', value:''});
    this.setState({filters: filterArray});
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
        color: 'rgb(0, 188, 212)',
        marginRight: "-6"
      },
    }
    var attributes = [];
    for (key in this.props.attributes) {
      var tmp = { payload:key, text: this.props.attributes[key] };
      attributes.push(tmp);
    }
    var menuItems = [{text:'Disabled', disabled:true}];
    var filters = this.state.filters.map(function(item, index) {
      return (
        <div className="filterPair" key={index}>
          <SelectField
            style={{width:"100%"}}
            value={item.key}
            onChange={this._updateFilterKey.bind(null, index)}
            hintText="Filter by"
            menuItems={attributes} />
          <TextField
            style={{width:"100%"}}
            value={item.value}
            onChange={this._updateFilterValue.bind(null, index)} />
        </div>
      )
    }, this);
    var filterNav = (
      <div className="filterWrapper">
        <div>
          <FlatButton onClick={this._toggleNav} label="Hide filters" />
        </div>
        {filters}
        <FlatButton onClick={this._addFilter} label="Add filter" secondary={true}>
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
          style={{padding: "10px 20px", top:"58"}} />

        <div style={{width:"100%", position:"relative"}}>
          <FlatButton style={{position:"absolute",right:"30", top:"-40"}} onClick={this._toggleNav} label={this.state.isDocked ? "Hide filters" : "Show filters"} />
        </div>
      </div>
    );
  }
});

module.exports = Filters;