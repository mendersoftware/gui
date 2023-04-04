import React from 'react';

import { List } from '@mui/material';

import ExpandableAttribute from '../common/expandable-attribute';

export const ArtifactMetadataList = ({ metaInfo = { content: [] } }) => {
  return (
    !!metaInfo.content.length && (
      <>
        <p className="margin-bottom-none">{metaInfo.title}</p>
        <List className="list-horizontal-flex" style={{ paddingTop: 0 }}>
          {metaInfo.content.map((info, index) => (
            <ExpandableAttribute key={`software-info-${index}`} {...info} />
          ))}
        </List>
      </>
    )
  );
};

export default ArtifactMetadataList;
