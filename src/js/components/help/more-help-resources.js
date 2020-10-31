import React from 'react';

const MoreHelp = ({ docsVersion = '', isHosted }) => {
  var support = isHosted ? 'mailto:support@mender.io' : 'mailto:contact@mender.io';
  const resources = [
    {
      pretext: 'Ask questions and find answers at the',
      target: 'https://hub.mender.io',
      linkTitle: 'Mender Hub community forum'
    },
    {
      pretext: 'Report a bug using',
      target: 'https://tracker.mender.io',
      linkTitle: 'our Bug Tracker'
    },
    {
      pretext: 'Read the',
      target: `https://docs.mender.io/${docsVersion}`,
      linkTitle: 'Mender documentation'
    }
  ];
  return (
    <div>
      <h2>More resources</h2>
      <p>{`If you can't find what you're looking for here, there are other places to find help with Mender:`}</p>
      <ul>
        {resources.map((item, index) => (
          <li key={`resource-${index}`}>
            <p>
              {item.pretext}{' '}
              <a href={item.target} target="_blank" rel="noopener noreferrer">
                {item.linkTitle}
              </a>
            </p>
          </li>
        ))}
      </ul>
      <br />
      <p>Other ways to get in touch:</p>
      <ul>
        <li>
          <p>
            <a href={support} target="_blank" rel="noopener noreferrer">
              Email us
            </a>{' '}
            with a question
          </p>
        </li>
        <li>
          <p>
            Follow us on Twitter{' '}
            <a href="https://twitter.com/mender_io" target="_blank" rel="noopener noreferrer">
              @mender_io
            </a>
          </p>
        </li>
      </ul>
    </div>
  );
};
export default MoreHelp;
