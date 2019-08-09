import { Dispatcher } from 'flux';

const AppDispatcher = Object.assign(new Dispatcher(), {
  handleViewAction: function(action) {
    const self = this;
    setTimeout(
      () =>
        self.dispatch({
          source: 'VIEW_ACTION',
          action: action
        }),
      1
    );
  }
});

export default AppDispatcher;
