import React from 'react';
import { List, ListItem, ListItemText, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import { FileSize, getFormattedSize } from './../../helpers';
import { colors } from '../../themes/Mender';
import Time from '../common/time';

export const inlineHeadingStyle = { position: 'absolute', background: colors.expansionBackground, top: -35, padding: 10 };

const METADATA_SPACING = 2;
const style = {
  metadataList: {
    display: 'flex',
    flexDirection: 'row'
  },
  table: {
    background: 'transparent'
  },
  metadataListItem: {
    paddingBottom: '11px',
    borderBottom: `1px solid ${colors.borderColor}`,
    marginRight: '2vw'
  },
  payloadHeader: { ...inlineHeadingStyle, background: '#e9e9e9' }
};
const attributes = ['Name', 'Checksum', 'Build date', 'Size (uncompressed)'];

export const ArtifactPayload = ({ index, payload: { files: payloadFiles, meta_data = {}, type_info } }) => {
  const files = payloadFiles || [];
  const summedSize = files.reduce((accu, item) => accu + item.size, 0);
  const metaDataObject = meta_data;
  const metaData = [
    { title: 'Type', value: type_info.type },
    { title: 'Total Size (uncompressed)', value: getFormattedSize(summedSize) }
  ];
  return (
    <div className="file-details">
      <h4 style={style.payloadHeader}>Payload {index}</h4>
      <List style={style.metadataList}>
        {metaData.map((item, index) => (
          <ListItem disabled={true} style={style.metadataListItem} classes={{ root: 'attributes', disabled: 'opaque' }} key={`metadata-item-${index}`}>
            <ListItemText primary={item.title} secondary={item.value} />
          </ListItem>
        ))}
      </List>
      <div className="file-meta">
        {Object.keys(metaDataObject).length ? (
          <div>
            <h4>Update Metadata</h4>
            <pre>
              <code>{JSON.stringify(metaDataObject, null, METADATA_SPACING)}</code>
            </pre>
          </div>
        ) : null}
        <h4>Files</h4>
        {files.length ? (
          <Table style={style.table}>
            <TableHead>
              <TableRow>
                {attributes.map((item, index) => (
                  <TableCell key={`file-header-${index}`} tooltip={item}>
                    {item}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody style={style.table}>
              {files.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file.name}</TableCell>
                  <TableCell style={{ wordBreak: 'break-word' }}>{file.checksum}</TableCell>
                  <TableCell>
                    <Time value={file.date} />
                  </TableCell>
                  <TableCell>
                    <FileSize fileSize={file.size} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>There are no files in this Artifact</p>
        )}
      </div>
    </div>
  );
};

export default ArtifactPayload;
