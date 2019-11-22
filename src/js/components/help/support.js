import React from 'react';
import { Link } from 'react-router-dom';

const Support = () => (
  <div>
    <h2>Support</h2>

    <p>
      Contact us directly for support with Hosted Mender at:{' '}
      <a href="mailto:support@mender.io" target="_blank">
        support@mender.io
      </a>
      .
    </p>
    <p>
      You can also try our <Link to={`/help/more-help-resources`}>other resources</Link> to find help from our community, our documentation and more.
    </p>
  </div>
);
export default Support;
