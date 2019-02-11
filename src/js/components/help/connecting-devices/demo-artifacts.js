import React from 'react';
import Loader from '../../common/loader';

// material ui
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';

export default class DemoArtifacts extends React.Component {
  _changePage(path) {
    this.props.changePage(path);
  }
  render() {
    var links = [];
    var placeholder;

    if (!this.props.isEmpty(this.props.links)) {
      for (var k in this.props.links.links) {
        // go through returned json to extract links per type + version
        if (typeof this.props.links.links[k] == 'object') {
          // if an object, expect it to be links for device type
          for (var version in this.props.links.links[k]) {
            var thisRow = { name: k, version: version };
            var versionLinks = this.props.links.links[k][version];
            if (typeof versionLinks == 'object') {
              var i = 0;

              for (var tmp in versionLinks) {
                var lastPart = tmp.split('.').pop();
                if (lastPart === 'mender') {
                  i++;
                  thisRow[`link${i}`] = versionLinks[tmp];
                }
              }
              links.push(thisRow);
            }
          }
        }
      }
    } else if (this.props.isHosted) {
      placeholder = (
        <div className="waiting-inventory">
          <p>Your images are currently being generated. Download links should appear here within 5 minutes</p>
          <Loader show={true} waiting={true} />
        </div>
      );
    }

    var tableRows = links.map((link, index) => {
      if (link.link1) {
        return (
          <TableRow key={link.name + index}>
            <TableCell>{link.name}</TableCell>
            <TableCell>{link.version}</TableCell>
            <TableCell>
              <a href={link.link2}>{link.link2}</a>
            </TableCell>
            <TableCell>
              <a href={link.link1}>{link.link1}</a>
            </TableCell>
          </TableRow>
        );
      }
    });

    return (
      <div>
        <h2>Download demo Artifacts</h2>

        <p>
          We provide demo Artifacts that you can use with devices connected to the Mender server (see{' '}
          <a onClick={() => this._changePage('help/connecting-devices/provision-a-demo')}>Provision demo device</a>).
        </p>
        <p>
          Two Artifacts are provided for each device type so that you can do several deployments (Mender will skip deployments if the Artifact installed is the
          same as the one being deployed).
        </p>

        {this.props.isHosted ? (
          <div>
            {!this.props.isEmpty(this.props.links) ? (
              <div>
                <p>Download the Artifacts for your desired device types below:</p>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Device type</TableCell>
                      <TableCell>Mender version</TableCell>
                      <TableCell>Artifact 1</TableCell>
                      <TableCell>Artifact 2</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{tableRows}</TableBody>
                </Table>
                <p>
                  Then upload them to the <a onClick={() => this._changePage('artifacts')}>Artifacts tab</a>.
                </p>
              </div>
            ) : (
              placeholder
            )}
          </div>
        ) : (
          <p>
            Download the Artifacts for your desired device types from{' '}
            <a href={`https://docs.mender.io/${this.props.docsVersion}getting-started/download-test-images`} target="_blank">
              the downloads page.
            </a>
          </p>
        )}
      </div>
    );
  }
}
