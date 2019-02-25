import React from 'react';
import Time from 'react-time';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Table from 'material-ui/Table/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableHeader from 'material-ui/Table/TableHeader';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableRow from 'material-ui/Table/TableRow';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TextField from 'material-ui/TextField';
import { FileSize, getFormattedSize } from './../../helpers';

const METADATA_SPACING = 2;

export default class ArtifactPayload extends React.PureComponent {
  render() {
    const style = {
      metadataList: {
        display: 'flex',
        flexDirection: 'row'
      },
      table: {
        background: 'transparent'
      }
    };
    const files = this.props.payload.files || [];
    const summedSize = files.reduce((accu, item) => accu + item.size, 0);
    const attributes = ['Name', 'Checksum', 'Build date', 'Size (uncompressed)'];
    const metaDataObject = this.props.payload.meta_data || {};
    const metaData = [{ title: 'Type', value: this.props.payload.type_info.type }, { title: 'Total size', value: getFormattedSize(summedSize) }];
    return (
      <div className="file-details">
        <List style={style.metadataList}>
          {metaData.map((item, index) => (
            <ListItem key={`metadata-item-${index}`}>
              <TextField disabled={true} defaultValue={item.value} floatingLabelText={item.title} />
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
            <Table selectable={false} style={style.table}>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                <TableRow>
                  {attributes.map((item, index) => (
                    <TableHeaderColumn key={`file-header-${index}`} tooltip={item}>
                      {item}
                    </TableHeaderColumn>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} style={style.table}>
                {files.map((file, index) => {
                  const build_date = <Time value={file.date} format="YYYY-MM-DD HH:mm" />;
                  return (
                    <TableRow key={index}>
                      <TableRowColumn>{file.name}</TableRowColumn>
                      <TableRowColumn>{file.checksum}</TableRowColumn>
                      <TableRowColumn>{build_date}</TableRowColumn>
                      <TableRowColumn>
                        <FileSize fileSize={file.size} />
                      </TableRowColumn>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p>There are no files in this artifact</p>
          )}
        </div>
      </div>
    );
  }
}
