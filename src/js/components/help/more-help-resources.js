import React from 'react';

export default class MoreHelp extends React.Component {
  render() {
    var support = this.props.isHosted ? 'mailto:support@hosted.mender.io' : 'mailto:contact@mender.io';

    return (
      <div>
        <h2>More help resources</h2>

        <p>{`If you can't find what you're looking for here, there are other places to find help getting started with Mender:`}</p>
        <br />

        <p>
          Visit our{' '}
          <a href={`https://docs.mender.io/${this.props.docsVersion}`} target="_blank">
            documentation site
          </a>
        </p>
        <p>
          Read our{' '}
          <a href={`https://docs.mender.io/${this.props.docsVersion}troubleshooting`} target="_blank">
            troubleshooting pages
          </a>{' '}
          or{' '}
          <a href="https://mender.io/faq" target="_blank">
            FAQs
          </a>
        </p>
        <p>
          Browse the topics or ask a question on the{' '}
          <a href="https://hub.mender.io" target="_blank">
            Mender Hub forum
          </a>
        </p>
        <p>
          <a href={support} target="_blank">
            Email us
          </a>{' '}
          with a question
        </p>
        <p>
          Submit a bug using{' '}
          <a href="https://tracker.mender.io" target="_blank">
            our bug tracker
          </a>
        </p>
      </div>
    );
  }
}
