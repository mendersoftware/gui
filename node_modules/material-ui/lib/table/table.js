'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var _state$muiTheme = state.muiTheme;
  var baseTheme = _state$muiTheme.baseTheme;
  var table = _state$muiTheme.table;


  return {
    root: {
      backgroundColor: table.backgroundColor,
      padding: '0 ' + baseTheme.spacing.desktopGutter + 'px',
      width: '100%',
      borderCollapse: 'collapse',
      borderSpacing: 0,
      tableLayout: 'fixed',
      fontFamily: baseTheme.fontFamily
    },
    bodyTable: {
      height: props.fixedHeader || props.fixedFooter ? props.height : 'auto',
      overflowX: 'hidden',
      overflowY: 'auto'
    },
    tableWrapper: {
      height: props.fixedHeader || props.fixedFooter ? 'auto' : props.height,
      overflow: 'auto'
    }
  };
}

var Table = _react2.default.createClass({
  displayName: 'Table',


  propTypes: {
    /**
     * Set to true to indicate that all rows should be selected.
     */
    allRowsSelected: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the body's table element.
     */
    bodyStyle: _react2.default.PropTypes.object,

    /**
     * Children passed to table.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * If true, the footer will appear fixed below the table.
     * The default value is true.
     */
    fixedFooter: _react2.default.PropTypes.bool,

    /**
     * If true, the header will appear fixed above the table.
     * The default value is true.
     */
    fixedHeader: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the footer's table element.
     */
    footerStyle: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the header's table element.
     */
    headerStyle: _react2.default.PropTypes.object,

    /**
     * The height of the table.
     */
    height: _react2.default.PropTypes.string,

    /**
     * If true, multiple table rows can be selected.
     * CTRL/CMD+Click and SHIFT+Click are valid actions.
     * The default value is false.
     */
    multiSelectable: _react2.default.PropTypes.bool,

    /**
     * Called when a row cell is clicked.
     * rowNumber is the row number and columnId is
     * the column number or the column key.
     */
    onCellClick: _react2.default.PropTypes.func,

    /**
     * Called when a table cell is hovered.
     * rowNumber is the row number of the hovered row
     * and columnId is the column number or the column key of the cell.
     */
    onCellHover: _react2.default.PropTypes.func,

    /**
     * Called when a table cell is no longer hovered.
     * rowNumber is the row number of the row and columnId
     * is the column number or the column key of the cell.
     */
    onCellHoverExit: _react2.default.PropTypes.func,

    /**
     * Called when a table row is hovered.
     * rowNumber is the row number of the hovered row.
     */
    onRowHover: _react2.default.PropTypes.func,

    /**
     * Called when a table row is no longer hovered.
     * rowNumber is the row number of the row that is no longer hovered.
     */
    onRowHoverExit: _react2.default.PropTypes.func,

    /**
     * Called when a row is selected.
     * selectedRows is an array of all row selections.
     * IF all rows have been selected, the string "all"
     * will be returned instead to indicate that all rows have been selected.
     */
    onRowSelection: _react2.default.PropTypes.func,

    /**
     * If true, table rows can be selected.
     * If multiple row selection is desired, enable multiSelectable.
     * The default value is true.
     */
    selectable: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the table's wrapper element.
     */
    wrapperStyle: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      allRowsSelected: false,
      fixedFooter: true,
      fixedHeader: true,
      height: 'inherit',
      multiSelectable: false,
      selectable: true
    };
  },
  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)(),
      allRowsSelected: this.props.allRowsSelected
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  isScrollbarVisible: function isScrollbarVisible() {
    var tableDivHeight = this.refs.tableDiv.clientHeight;
    var tableBodyHeight = this.refs.tableBody.clientHeight;

    return tableBodyHeight > tableDivHeight;
  },
  _createTableHeader: function _createTableHeader(base) {
    return _react2.default.cloneElement(base, {
      enableSelectAll: base.props.enableSelectAll && this.props.selectable && this.props.multiSelectable,
      onSelectAll: this._onSelectAll,
      selectAllSelected: this.state.allRowsSelected
    });
  },
  _createTableBody: function _createTableBody(base) {
    return _react2.default.cloneElement(base, {
      allRowsSelected: this.state.allRowsSelected,
      multiSelectable: this.props.multiSelectable,
      onCellClick: this._onCellClick,
      onCellHover: this._onCellHover,
      onCellHoverExit: this._onCellHoverExit,
      onRowHover: this._onRowHover,
      onRowHoverExit: this._onRowHoverExit,
      onRowSelection: this._onRowSelection,
      selectable: this.props.selectable,
      style: (0, _simpleAssign2.default)({ height: this.props.height }, base.props.style)
    });
  },
  _createTableFooter: function _createTableFooter(base) {
    return base;
  },
  _onCellClick: function _onCellClick(rowNumber, columnNumber, event) {
    if (this.props.onCellClick) this.props.onCellClick(rowNumber, columnNumber, event);
  },
  _onCellHover: function _onCellHover(rowNumber, columnNumber, event) {
    if (this.props.onCellHover) this.props.onCellHover(rowNumber, columnNumber, event);
  },
  _onCellHoverExit: function _onCellHoverExit(rowNumber, columnNumber, event) {
    if (this.props.onCellHoverExit) this.props.onCellHoverExit(rowNumber, columnNumber, event);
  },
  _onRowHover: function _onRowHover(rowNumber) {
    if (this.props.onRowHover) this.props.onRowHover(rowNumber);
  },
  _onRowHoverExit: function _onRowHoverExit(rowNumber) {
    if (this.props.onRowHoverExit) this.props.onRowHoverExit(rowNumber);
  },
  _onRowSelection: function _onRowSelection(selectedRows) {
    if (this.state.allRowsSelected) this.setState({ allRowsSelected: false });
    if (this.props.onRowSelection) this.props.onRowSelection(selectedRows);
  },
  _onSelectAll: function _onSelectAll() {
    if (this.props.onRowSelection) {
      if (!this.state.allRowsSelected) {
        this.props.onRowSelection('all');
      } else {
        this.props.onRowSelection('none');
      }
    }

    this.setState({ allRowsSelected: !this.state.allRowsSelected });
  },
  render: function render() {
    var _this = this;

    var _props = this.props;
    var children = _props.children;
    var className = _props.className;
    var fixedFooter = _props.fixedFooter;
    var fixedHeader = _props.fixedHeader;
    var style = _props.style;
    var wrapperStyle = _props.wrapperStyle;
    var headerStyle = _props.headerStyle;
    var bodyStyle = _props.bodyStyle;
    var footerStyle = _props.footerStyle;

    var other = _objectWithoutProperties(_props, ['children', 'className', 'fixedFooter', 'fixedHeader', 'style', 'wrapperStyle', 'headerStyle', 'bodyStyle', 'footerStyle']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var tHead = void 0;
    var tFoot = void 0;
    var tBody = void 0;

    _react2.default.Children.forEach(children, function (child) {
      if (!_react2.default.isValidElement(child)) return;

      var displayName = child.type.displayName;
      if (displayName === 'TableBody') {
        tBody = _this._createTableBody(child);
      } else if (displayName === 'TableHeader') {
        tHead = _this._createTableHeader(child);
      } else if (displayName === 'TableFooter') {
        tFoot = _this._createTableFooter(child);
      }
    });

    // If we could not find a table-header and a table-body, do not attempt to display anything.
    if (!tBody && !tHead) return null;

    var mergedTableStyle = (0, _simpleAssign2.default)(styles.root, style);
    var headerTable = void 0;
    var footerTable = void 0;
    var inlineHeader = void 0;
    var inlineFooter = void 0;

    if (fixedHeader) {
      headerTable = _react2.default.createElement(
        'div',
        { style: prepareStyles((0, _simpleAssign2.default)({}, headerStyle)) },
        _react2.default.createElement(
          'table',
          { className: className, style: mergedTableStyle },
          tHead
        )
      );
    } else {
      inlineHeader = tHead;
    }

    if (tFoot !== undefined) {
      if (fixedFooter) {
        footerTable = _react2.default.createElement(
          'div',
          { style: prepareStyles((0, _simpleAssign2.default)({}, footerStyle)) },
          _react2.default.createElement(
            'table',
            { className: className, style: prepareStyles(mergedTableStyle) },
            tFoot
          )
        );
      } else {
        inlineFooter = tFoot;
      }
    }

    return _react2.default.createElement(
      'div',
      { style: prepareStyles((0, _simpleAssign2.default)(styles.tableWrapper, wrapperStyle)) },
      headerTable,
      _react2.default.createElement(
        'div',
        { style: prepareStyles((0, _simpleAssign2.default)(styles.bodyTable, bodyStyle)), ref: 'tableDiv' },
        _react2.default.createElement(
          'table',
          { className: className, style: mergedTableStyle, ref: 'tableBody' },
          inlineHeader,
          inlineFooter,
          tBody
        )
      ),
      footerTable
    );
  }
});

exports.default = Table;