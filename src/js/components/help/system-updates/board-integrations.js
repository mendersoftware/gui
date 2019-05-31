import React from 'react';
import PropTypes from 'prop-types';

export default class BoardIntegrations extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {

    return (
      <div>
        <h2>Supported board integrations on Mender Hub</h2>
        
        <p>
          Check out the board integrations at <a href="https://hub.mender.io/c/board-integrations" target="_blank">Mender Hub</a> to see if your board has already been integrated. 
          There are over 30 different board and OS combinations, and more being added by the community.
        </p>

        <p>Each post has instructions on how to configure your board to integrate it with the Mender client and to connect to the Mender server.</p>
          
        <p>Find your board on <a href="https://hub.mender.io/c/board-integrations" target="_blank">Mender Hub</a>.</p>

      </div>
    );
  }
}
