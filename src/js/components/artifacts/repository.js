import React from 'react';
import PropTypes from 'prop-types';
import Time from 'react-time';
import AppActions from '../../actions/app-actions';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
import { UploadArtifact, ExpandArtifact } from '../helptips/helptooltips';
import Loader from '../common/loader';
import SearchInput from 'react-search-input';
import SelectedArtifact from './selectedartifact';
import Dropzone from 'react-dropzone';

// material ui
import Collapse from '@material-ui/core/Collapse';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import FileIcon from '@material-ui/icons/CloudUpload';
import HelpIcon from '@material-ui/icons/Help';
import SortIcon from '@material-ui/icons/Sort';

import { preformatWithRequestID, formatTime } from '../../helpers';

var artifacts = [];

export default class Repository extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      artifact: {
        name: null,
        description: null,
        device_types: null
      },
      sortCol: 'name',
      sortDown: true,
      searchTerm: null,
      upload: false,
      popupLabel: 'Upload a new artifact',
      artifacts: [],
      tmpFile: null,
      divHeight: 178
    };
  }

  componentWillReceiveProps(nextProps) {
    artifacts = nextProps.artifacts;
    if (nextProps.selected) {
      this.setState({ artifact: nextProps.selected });
    }
  }

  _resetArtifactState() {
    var artifact = {
      name: null,
      description: null,
      device_types: null
    };
    this.setState({ artifact: artifact });
  }
  onDrop(acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length) {
      this._onUploadSubmit(acceptedFiles);
    }
    if (rejectedFiles.length) {
      AppActions.setSnackbar(`File '${rejectedFiles[0].name}' was rejected. File must be of type .mender`, null);
    }
  }
  _onUploadSubmit(files) {
    var self = this;
    //var tmpFile = meta.artifactFile;
    //delete meta.artifactFile;
    //delete meta.verified;
    var meta = { description: '' };
    files.forEach(file => {
      self.props.uploadArtifact(meta, file);
    });

    this._resetArtifactState();
  }
  _editArtifactData(id, description) {
    var self = this;
    var body = {
      description: description
    };
    return AppActions.editArtifact(id, body)
      .then(() => {
        AppActions.setSnackbar('Artifact details were updated successfully.', 5000, '');
        var updated = self.state.artifact;
        updated.description = description;
        self.setState({ artifact: updated });
        self.props.refreshArtifacts();
      })
      .catch(err => {
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(errMsg, `Artifact details couldn't be updated. ${err.error}`), null, 'Copy to clipboard');
      });
  }

  _onRowSelection(rowNumber, shouldToggleRow) {
    var artifact = artifacts[rowNumber];
    if (shouldToggleRow) {
      if (this.state.artifact === artifact) {
        this._resetArtifactState();
      } else {
        this.setState({ artifact });
      }
    }
  }
  _sortColumn(col) {
    var direction;
    if (this.state.sortCol !== col) {
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = 'sortIcon material-icons';
      ReactDOM.findDOMNode(this.refs[col]).className = 'sortIcon material-icons expand';
      this.setState({ sortCol: col, sortDown: true });
      direction = true;
    } else {
      direction = !this.state.sortDown;
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = `sortIcon material-icons expand ${direction}`;
      this.setState({ sortDown: direction });
    }
    // sort table
    AppActions.sortTable('_artifactsRepo', col, direction);
  }
  searchUpdated(term) {
    this.setState({ searchTerm: term, artifact: {} }); // needed to force re-render
  }

  _adjustCellHeight(height) {
    this.setState({ divHeight: height + 110 });
  }
  _handleRemove() {
    // pass artifact to be removed up to parent to trigger dialog
    this.props.removeArtifact(this.state.artifact);
  }
  render() {
    const self = this;

    var tmpArtifacts = [];
    if (self.refs.search) {
      var filters = ['name', 'device_types_compatible', 'description'];
      tmpArtifacts = artifacts.filter(self.refs.search.filter(filters));
    }

    var items = tmpArtifacts.map(function(pkg, index) {
      var compatible = pkg.device_types_compatible.join(', ');
      var expanded = '';
      if (self.state.artifact.id === pkg.id) {
        expanded = (
          <SelectedArtifact
            removeArtifact={() => self._handleRemove()}
            compatible={compatible}
            formatTime={formatTime}
            editArtifact={self._editArtifactData}
            // buttonStyle={styles.flatButtonIcon}
            artifact={self.state.artifact}
          />
        );
      }
      const artifactType = pkg.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '');
      return (
        <TableRow hover={!expanded} className={expanded ? 'expand' : null} key={index} onClick={() => self._onRowSelection(index)}>
          <TableCell style={expanded ? { height: self.state.divHeight } : null}>{pkg.name}</TableCell>
          <TableCell>{compatible}</TableCell>
          <TableCell>
            <Time value={formatTime(pkg.modified)} format="YYYY-MM-DD HH:mm" />
          </TableCell>
          <TableCell
            className="expandButton"
            onClick={() => self._onRowSelection(index, true)}
            style={{ width: '55px', paddingRight: '0', paddingLeft: '12px' }}
          >
            <IconButton className="float-right">
              <Icon className="material-icons">{expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</Icon>
            </IconButton>
          </TableCell>
          <TableCell padding={'none'} style={{ width: '0' }} colSpan="4">
            <Collapse
              hidden={!expanded}
              in={!!expanded}
              // springConfig={{ stiffness: 210, damping: 20 }}
              // onMeasure={measurements => self._adjustCellHeight(measurements.height)}
              // className="expanded"
              unmountOnExit
            >
              {expanded}
            </Collapse>
          </TableCell>
        </TableRow>
      );
    }, this);
    const columnHeaders = [
      { title: 'Name', name: 'name' },
      { title: 'Device type compatibility', name: 'device_types' },
      { title: 'Last modified', name: 'modified' }
    ];
    return (
      <div>
        <div className={items.length ? 'top-right-button fadeIn' : 'top-right-button fadeOut'}>
          <Dropzone
            disabled={this.props.progress > 0}
            activeClassName="active"
            rejectClassName="active"
            multiple={false}
            accept=".mender"
            onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="dropzone onboard dashboard-placeholder">
                <input {...getInputProps()} />
                <div className="icon inline-block">
                  <FileIcon style={{ height: '24px', width: '24px', verticalAlign: 'middle', marginTop: '-2px' }} />
                </div>
                <div className="dashboard-placeholder inline">
                  Drag here or <a>browse</a> to upload an artifact file
                </div>
              </div>
            )}
          </Dropzone>
        </div>

        <div>
          <h3 className="inline-block">Available artifacts</h3>
          <SearchInput placeholder="Search artifacts" className="search tableSearch" ref="search" onChange={term => self.searchUpdated(term)} />
        </div>

        <div id="progressBarContainer" className={self.props.progress ? null : 'shrunk'}>
          <p className="align-center">Upload in progress ({Math.round(self.props.progress)}%)</p>
          <LinearProgress mode="determinate" style={{ backgroundColor: '#c7c7c7', margin: '15px 0' }} value={self.props.progress} />
        </div>

        <Loader show={self.props.loading} />

        <div style={{ position: 'relative', marginTop: '10px' }}>
          <Table className={items.length ? null : 'hidden'}>
            <TableHead>
              <TableRow>
                {columnHeaders.map(item => (
                  <TableCell key={item.name} className="columnHeader" tooltip={item.title}>
                    {item.title}
                    <SortIcon ref={item.name} onClick={() => self._sortColumn(item.name)} className="sortIcon" />
                  </TableCell>
                ))}
                <TableCell style={{ width: '55px', paddingRight: '12px', paddingLeft: '0' }} className="columnHeader" />
              </TableRow>
            </TableHead>
            <TableBody className="clickable">{items}</TableBody>
          </Table>

          {self.props.showHelptips && items.length ? (
            <div>
              <div id="onboard-10" className="tooltip help" data-tip data-for="artifact-expand-tip" data-event="click focus">
                <HelpIcon />
              </div>
              <ReactTooltip id="artifact-expand-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                <ExpandArtifact />
              </ReactTooltip>
            </div>
          ) : null}

          <div className={items.length || self.props.loading || self.props.progress ? 'hidden' : 'dashboard-placeholder fadeIn'}>
            <Dropzone
              disabled={self.props.progress > 0}
              activeClassName="active"
              rejectClassName="active"
              multiple={false}
              accept=".mender"
              onDrop={(accepted, rejected) => self.onDrop(accepted, rejected)}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className="dropzone onboard dashboard-placeholder">
                  <input {...getInputProps()} />
                  <p style={{ width: '500px', fontSize: '16px', margin: 'auto' }}>
                    No artifacts found. Drag a file here or <a>browse</a> to upload to the repository
                  </p>
                  <img src="assets/img/artifacts.png" alt="artifacts" />
                </div>
              )}
            </Dropzone>
            {this.props.showHelptips ? (
              <div>
                <div id="onboard-9" className="tooltip help highlight" data-tip data-for="artifact-upload-tip" data-event="click focus">
                  <HelpIcon />
                </div>
                <ReactTooltip id="artifact-upload-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                  <UploadArtifact />
                </ReactTooltip>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
