import React from 'react';
import { Link } from 'react-router-dom';
import CopyToClipboard from 'react-copy-to-clipboard';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import CopyPasteIcon from '@material-ui/icons/FileCopy';

import AppActions from '../../../actions/app-actions';
import AppStore from '../../../stores/app-store';
import { detectOsIdentifier } from '../../../helpers';

// we don't support windows yet, so we'll point them to the linux file instead
const downloadFolder = {
  Windows: 'linux',
  MacOs: 'darwin',
  Unix: 'linux',
  Linux: 'linux'
};

export default class CreateArtifactDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      progress: 1,
      copied: 0
    };
  }

  onBackClick() {
    const self = this;
    let state = { progress: self.state.progress - 1 };
    if (!state.progress) {
      state = { progress: 1 };
    }
    self.setState(state);
  }

  copied(copied) {
    var self = this;
    self.setState({ copied });
    setTimeout(() => {
      self.setState({ copied: 0 });
    }, 5000);
  }

  render() {
    const self = this;
    const { open, onCancel } = self.props;
    const { copied, progress } = self.state;
    const deviceType = AppStore.getOnboardingDeviceType() || 'qemux86-64';

    const artifactGenerator = 'single-file-artifact-gen';
    const artifactName = 'demo-webserver-updated';
    const chmodCode = `
wget https://d1b0l86ne08fsf.cloudfront.net/mender-artifact/${AppStore.getMenderArtifactVersion()}/${downloadFolder[detectOsIdentifier()]}/mender-artifact && \\
chmod +x mender-artifact && \\
wget https://raw.githubusercontent.com/mendersoftware/mender/${AppStore.getMenderVersion()}/support/modules-artifact-gen/${artifactGenerator} && \\
chmod +x ${artifactGenerator} && \\
sudo cp mender-artifact ${artifactGenerator} /usr/local/bin/
`;

    const artifactGenCode = `
ARTIFACT_NAME="${artifactName}" && \\
DEVICE_TYPE="${deviceType}" && \\
OUTPUT_PATH="${artifactName}.mender" && \\
DEST_DIR="/var/www/localhost/htdocs/" && \\
FILE_NAME="index.html" && \\
${artifactGenerator} -n \${ARTIFACT_NAME} \
-t \${DEVICE_TYPE} -d \${DEST_DIR} -o \${OUTPUT_PATH} \
\${FILE_NAME}
`;

    const file_modification = `cat >index.html <<EOF
Hello World!
EOF
`;

    const steps = {
      1: (
        <div>
          <div className="muted">Follow these steps on your workstation. Estimated time 5 minutes.</div>
          <ol className="spaced-list">
            <li>
              Download both mender-artifact and {artifactGenerator} and make them executable by running:
              <div className="code">
                <CopyToClipboard text={chmodCode} onCopy={() => self.copied(1)}>
                  <Button style={{ float: 'right', margin: '-10px 0 0 10px' }}>
                    <CopyPasteIcon />
                    Copy to clipboard
                  </Button>
                </CopyToClipboard>
                <span style={{ wordBreak: 'break-word' }}>{chmodCode}</span>
              </div>
              <p>{copied === 1 ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
            </li>

            <li>
              Next, create a new <i>index.html</i> file with the simple contents &apos;Hello world&apos;. This will be the web page of your updated application,
              so you&apos;ll be able to easily see when your device has received the update. Copy and run the command:
              <div className="code">
                <CopyToClipboard text={file_modification} onCopy={() => self.copied(3)}>
                  <Button style={{ float: 'right', margin: '-20px 0 0 10px' }}>
                    <CopyPasteIcon />
                    Copy to clipboard
                  </Button>
                </CopyToClipboard>
                <span style={{ wordBreak: 'break-word' }}>{file_modification}</span>
              </div>
              <p>{copied === 3 ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
            </li>
            <li>
              Now you can create a new version of the demo webserver application with this <i>index.html</i> file. Generate a new Artifact by copying & running:
              <div className="code">
                <CopyToClipboard text={artifactGenCode} onCopy={() => self.copied(2)}>
                  <Button style={{ float: 'right', margin: '-10px 0 0 10px' }}>
                    <CopyPasteIcon />
                    Copy to clipboard
                  </Button>
                </CopyToClipboard>
                <span style={{ wordBreak: 'break-word' }}>{artifactGenCode}</span>
              </div>
              <p>{copied === 2 ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
            </li>
          </ol>
        </div>
      ),
      2: (
        <div>
          <p>
            You should now have a new Artifact file called <i>{artifactName}.mender</i>!
          </p>
          <p>
            If you upload <i>{artifactName}.mender</i> to the Mender server, it will create a new Release. You can then deploy this new Release of the webserver
            demo to your device, and when it has updated successfully you&apos;ll see the webpage&apos;s contents will have been replaced with the &quot;Hello
            world&quot; string you modified.
          </p>
          <p>Click &apos;Next&apos; to continue to upload the new Artifact.</p>
        </div>
      )
    };

    return (
      <Dialog open={open || false} fullWidth={true} maxWidth={progress > 1 ? 'sm' : 'md'}>
        <DialogTitle>Creating a new Artifact</DialogTitle>
        <DialogContent className="onboard-dialog">{steps[progress]}</DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <div style={{ flexGrow: 1 }} />
          {progress > 1 ? <Button onClick={() => self.onBackClick()}>Back</Button> : null}
          {progress < 2 ? (
            <Button variant="contained" onClick={() => self.setState({ progress: progress + 1 })}>
              Next
            </Button>
          ) : (
            <Button variant="contained" component={Link} to="/releases" onClick={() => AppActions.setShowCreateArtifactDialog(false)}>
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}
