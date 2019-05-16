import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class Support extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {

    return (
      <div>
        <h2>Support</h2>
       
        <p>Contact us directly for support with Hosted Mender at: <a href="mailto:support@hosted.mender.io" target="_blank">support@hosted.mender.io</a>.</p>
        <p>You can also try our <Link to={`/help/more-help-resources`}>other resources</Link> to find help from our community, our documentation and more.</p>
   
      </div>
    );
  }
}
