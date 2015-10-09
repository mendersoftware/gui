var AppConstants = require('../constants/app-constants');
var AppDispatcher = require('../dispatchers/app-dispatcher');


var AppActions = {
 
  selectGroup: function(groupId) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.SELECT_GROUP,
      groupId: groupId
    })
  },
  
}

module.exports = AppActions;