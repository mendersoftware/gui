var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');


var AppActions = {
 
  selectGroup: function(groupId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_GROUP,
      groupId: groupId
    })
  },

  selectNodes: function(nodeList) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_NODES,
      nodes: nodeList
    })
  },

  addToGroup: function(groupId, nodeList) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_TO_GROUP,
      groupId: groupId,
      nodes: nodeList
    })
  },
  
}

module.exports = AppActions;