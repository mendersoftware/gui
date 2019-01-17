import React from 'react';
import Paper from 'material-ui/Paper';
import HelpIcon from 'react-material-icons/icons/communication/live-help';

export default class Support extends React.Component {
  render() {
    var supportLink = 'https://mender.io/product/software-support'; // change when website is updated

    return (
      <div id="software-support">
        <hr />
        <div className="inline-block" style={{ width: '50%', marginRight: '10%' }}>
          <h2>Software support</h2>
          <p>
            Mender offers subscription support to provide you with immediate contact to our knowledgable team. We can help you quickly resolve any questions or
            issues that arise with guaranteed response and resolution times.
          </p>
          <p>
            <a href={supportLink} target="_blank">
              Find out more
            </a>
          </p>
        </div>
        <div className="inline-block" style={{ verticalAlign: 'top' }}>
          <a href={supportLink} target="_blank">
            <Paper zDepth={1} className="help-section" style={{ marginTop: 0 }}>
              <HelpIcon />
              <p>Software support</p>
            </Paper>
          </a>
        </div>
      </div>
    );
  }
}
