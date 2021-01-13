import React from 'react';
import { connect } from 'react-redux';

export class LiveChatBox extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const { isHosted, user } = this.props;
    if (prevProps.user?.email !== user?.email && isHosted && user.email) {
      // if hosted, load livechat widget
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
                  email: user.email
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

  render() {
    return null;
  }
}

const mapStateToProps = state => {
  return {
    isHosted: state.app.features.isHosted,
    user: state.users.byId[state.users.currentUser] || { email: '', id: null }
  };
};

export default connect(mapStateToProps)(LiveChatBox);
