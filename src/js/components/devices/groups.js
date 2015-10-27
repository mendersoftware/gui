var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

// material ui
var mui = require('material-ui');
var List = mui.List;
var ListItem = mui.ListItem;
var ListDivider = mui.ListDivider;

var Groups = React.createClass({
  _changeGroup: function(id) {
    AppActions.selectGroup(id);
  },
  render: function() {
    return (
      <List subheader="Groups">
        {this.props.groups.map(function(group) {
          if (group.type==='public') {
            var isSelected = group.id===this.props.selectedGroup.id ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"};
            var boundClick = this._changeGroup.bind(null, group.id);
            return (
              <ListItem 
                key={group.id} 
                primaryText={group.name} 
                style={isSelected}
                onClick={boundClick} />
            )
          }
        }, this)}
      </List>
    );
  }
});


module.exports = Groups;