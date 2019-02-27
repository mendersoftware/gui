import AppActions from '../actions/app-actions';
import AppStore from '../stores/app-store';
import cookie from 'react-cookie';

export function toggleHelptips() {
  var user = AppStore.getCurrentUser();
  if (user.id) {
    // if current user id available from store
    var userCookie = cookie.load(user.id) || {};
    var updatedValue = !userCookie.help;
    userCookie.help = updatedValue;
    userCookie = JSON.stringify(userCookie);
    cookie.save(user.id, userCookie);
    AppActions.setShowHelptips(updatedValue);
  }
}

export function hideAnnouncement(hash) {
  var user = AppStore.getCurrentUser();
  if (user.id) {
    cookie.save(user.id + hash, true, { maxAge: 604800 });
  }
}
