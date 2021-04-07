import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { SvgIcon, Tooltip } from '@mui/material';
import { withStyles } from 'tss-react/mui';

import { mdiBullhorn as BullhornIcon } from '@mdi/js';
import axios from 'axios';

// material ui

const LightTooltip = withStyles(Tooltip, theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    color: theme.palette.text.primary,
    fontSize: 11,
    maxHeight: '75vh',
    minWidth: 500,
    overflow: 'auto'
  }
}));

const FeatureNotification = ({ changelogIndex = 4 }) => {
  const [changelog, setChangelog] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [counter, setCounter] = useState(changelogIndex);
  const notificationContainer = useRef();

  useEffect(() => {
    getChangelogs();
  }, []);

  useEffect(() => {
    if (!notificationContainer.current) {
      return;
    }
    notificationContainer.current.parentElement.addEventListener('scroll', handleScroll);
    return () => {
      notificationContainer.current?.parentElement.removeEventListener('scroll', handleScroll);
    };
  }, [notificationContainer.current, counter, isFetching]);

  useEffect(() => {
    if (!isFetching) {
      return;
    }
    getChangelogs();
  }, [isFetching]);

  const getChangelogs = () => {
    axios
      .get(
        // 'https://raw.githubusercontent.com/mendersoftware/mender-docs/master/.github/PULL_REQUEST_TEMPLATE.md'
        // 'https://raw.githubusercontent.com/mendersoftware/mender-docs/master/01.Get-started/01.Preparation/01.Prepare-a-Raspberry-Pi-device/docs.md'
        `https://raw.githubusercontent.com/mendersoftware/mender.io/master/user/pages/blog/99.mender-2-6-release-secure-remote-access-and-customizability/blog.en.md?token=AADVXQYF3EWPJFT6LDNX6BTAO26UI`
      )
      .then(res => {
        const parsedResponse = parseFullMarkdown(res.data);
        setCounter(counter - 1);
        setChangelog([...changelog, { content: parsedResponse, index: changelog.length }]);
      })
      .catch(console.log)
      .finally(() => setIsFetching(false));
  };

  const handleScroll = () => {
    // start loading more content once we get to the bottom 5% of the existing content
    if (
      notificationContainer.current.scrollHeight -
        (notificationContainer.current.parentElement.offsetHeight + notificationContainer.current.parentElement.scrollTop) >
        (notificationContainer.current.parentElement.offsetHeight / 100) * 5 ||
      isFetching ||
      counter <= 0
    ) {
      return;
    }
    setIsFetching(true);
  };

  const parseFullMarkdown = content => {
    const lines = content.split('\n');
    let index = 0;
    let hasSeenThings = false;
    for (index; index < lines.length; index++) {
      const line = lines[index];
      if (line.search(/-{3}/) > -1) {
        if (hasSeenThings) {
          break;
        }
        hasSeenThings = true;
      }
    }
    const strippedContent = lines.slice(index + 1).join('\n');
    return strippedContent.length ? strippedContent : content;
  };

  const transformImageUri = uri => {
    return uri.startsWith('http')
      ? uri
      : `https://raw.githubusercontent.com/mendersoftware/mender-docs/master/01.Get-started/01.Preparation/01.Prepare-a-Raspberry-Pi-device/${uri}` ||
          `https://raw.githubusercontent.com/mendersoftware/mender.io/master/user/pages/blog/99.mender-2-6-release-secure-remote-access-and-customizability/${uri}?token=AADVXQYF3EWPJFT6LDNX6BTAO26UI`;
  };

  return (
    <div className="announcement-red clickable flexbox centered">
      <SvgIcon fontSize="small">
        <path d={BullhornIcon} />
      </SvgIcon>
      <LightTooltip
        interactive
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        placement="bottom"
        classes={{ tooltip: 'featureNotification' }}
        title={
          <div ref={notificationContainer}>
            <h3>What&apos;s new</h3>
            {changelog.map(entry => (
              <ReactMarkdown key={entry.index} transformImageUri={transformImageUri}>
                {entry.content}
              </ReactMarkdown>
            ))}
            <p>
              Your devices first need to have the Mender client running on them in order to connect to the server. We support several ways of integrating your
              device with Mender and connecting it to the Mender server.
            </p>
            <p>
              For a detailed introduction to the different approaches to do this, please refer to our{' '}
              <a href="https://docs.mender.io/get-started" target="_blank" rel="noopener noreferrer">
                documentation
              </a>
              .
            </p>
          </div>
        }
      >
        <div className="margin-left-small">Find out what&apos;s new in the latest update</div>
      </LightTooltip>
    </div>
  );
};

export default FeatureNotification;
