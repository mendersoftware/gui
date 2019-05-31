import React from 'react';
import PropTypes from 'prop-types';

export default class ReleasesArtifacts extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {

    return (
      <div>
        <h2>Releases and Artifacts</h2>
       
        <p>Whether it’s a partial or a full system update, the software you want to deploy to your devices must be packaged as an <b>Artifact</b>. 
        An Artifact is a <span className="code">.mender</span> file format that contains your software and some metadata, which includes a <b>device type</b>. 
        The device type is used by the Mender client and server to ensure your software is only deployed to compatible devices.</p> 

        <p>Artifacts are grouped by <b>Release</b>. If you have a version of your software that requires slightly different 
        Artifacts in order to make it compatible with different boards, assign them the same name and different device types and they will be grouped as part of the same Release in the UI.</p>
        
        
        <p><a href={`https://docs.mender.io/${this.props.docsVersion}artifacts`} target="_blank">Read the documentation for more on creating Artifacts</a>.</p>
      </div>
    );
  }
}
