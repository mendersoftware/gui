import React from 'react';
import { connect } from 'react-redux';
import { decodeSessionToken } from '../helpers';
import { getUser } from '../actions/userActions';
import Cookies from 'universal-cookie';

export class LiveChatBox extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      gettingUser: false
    };
    this.cookies = new Cookies();
  }

  componentDidMount() {
    const self = this;
    self._updateUsername();
    // if hosted, load livechat widget
    if (self.props.isHosted) {
      // load script created by entrypoint
      const script = document.createElement('script');
      script.setAttribute('id', 'livechat');
      script.src = 'livechat.js';
      script.async = true;
      document.head.appendChild(script);
      document.head.addEventListener(
        'load',
        function (event) {
          if (event.target.nodeName === 'SCRIPT' && event.target.getAttribute('src') === 'livechat.js') {
            // if script has loaded, trigger function to insert user email into widget
            window.HFCHAT_CONFIG.onload = function () {
              this.setVisitorInfo(
                {
                  email: self.props.user.email
                },
                function (err) {
                  if (err) {
                    console.error('Failed to set visitor details. Error:', err);
                  }
                }
              );
            };
          }
        },
        true
      );
    }
  }

  _updateUsername() {
    const userId = decodeSessionToken(this.cookies.get('JWT'));
    if (this.state.gettingUser || !userId) {
      return;
    }
    const self = this;
    self.setState({ gettingUser: true });
    // get current user
    return self.props
      .getUser(userId)
      .catch(err => console.log(err.res ? err.res.error : err))
      .finally(() => self.setState({ gettingUser: false }));
  }

  render() {
    return null;
  }
}

const actionCreators = {
  getUser
};

const mapStateToProps = state => {
  return {
    isHosted: state.app.features.isHosted,
    user: state.users.byId[state.users.currentUser] || { email: '', id: null }
  };
};

export default connect(mapStateToProps, actionCreators)(LiveChatBox);
