import React from 'react';

export default class MoreHelp extends React.Component {
  render() {
    var support = this.props.isHosted ? 'mailto:support@hosted.mender.io' : 'mailto:contact@mender.io';

    return (
      <div>
        <h2>More resources</h2>

        <p>{`If you can't find what you're looking for here, there are other places to find help with Mender:`}</p>

        <ul>
          <li>
            <p>Ask questions and find answers at the{' '}
              <a href="https://hub.mender.io" target="_blank">
                Mender Hub community forum
              </a>
            </p>
          </li>

          <li>
            <p>Report a bug using{' '}
              <a href="https://tracker.mender.io" target="_blank">
                our Bug Tracker
              </a>
            </p>
          </li>

          <li>
            <p>Read the{' '}
              <a href={`https://docs.mender.io/${this.props.docsVersion}`} target="_blank">
                Mender documentation
              </a>
            </p>
          </li>
        </ul>
        
        <br/>
        <p>Other ways to get in touch:</p>
        <ul>
          <li>
            <p>
              <a href={support} target="_blank">
                Email us
              </a>{' '}
              with a question
            </p>
          </li>
          <li>
            <p>
              Follow us on Twitter{' '}
              <a href="https://twitter,com/mender_io" target="_blank">
                @mender_io
              </a>
            </p>
          </li>
        </ul>
      </div>
    );
  }
}
