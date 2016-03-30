'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var tableRow = state.muiTheme.tableRow;


  var cellBgColor = 'inherit';
  if (props.hovered || state.hovered) {
    cellBgColor = tableRow.hoverColor;
  } else if (props.selected) {
    cellBgColor = tableRow.selectedColor;
  } else if (props.striped) {
    cellBgColor = tableRow.stripeColor;
  }

  return {
    root: {
      borderBottom: props.displayBorder && '1px solid ' + tableRow.borderColor,
      color: tableRow.textColor,
      height: tableRow.height
    },
    cell: {
      backgroundColor: cellBgColor
    }
  };
}

var TableRow = _react2.default.createClass({
  displayName: 'TableRow',


  propTypes: {
    /**
     * Children passed to table row.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * If true, row border will be displayed for the row.
     * If false, no border will be drawn.
     */
    displayBorder: _react2.default.PropTypes.bool,

    /**
     * Controls whether or not the row reponseds to hover events.
     */
    hoverable: _react2.default.PropTypes.bool,

    /**
     * Controls whether or not the row should be rendered as being
     * hovered. This property is evaluated in addition to this.state.hovered
     * and can be used to synchronize the hovered state with some other
     * external events.
     */
    hovered: _react2.default.PropTypes.bool,

    /**
     * @ignore
     * Called when a row cell is clicked.
     * rowNumber is the row number and columnId is
     * the column number or the column key.
     */
    onCellClick: _react2.default.PropTypes.func,

    /**
     * @ignore
     * Called when a table cell is hovered.
     * rowNumber is the row number of the hovered row
     * and columnId is the column number or the column key of the cell.
     */
    onCellHover: _react2.default.PropTypes.func,

    /**
     * @ignore
     * Called when a table cell is no longer hovered.
     * rowNumber is the row number of the row and columnId
     * is the column number or the column key of the cell.
     */
    onCellHoverExit: _react2.default.PropTypes.func,

    /**
     * @ignore
     * Called when row is clicked.
     */
    onRowClick: _react2.default.PropTypes.func,

    /**
     * @ignore
     * Called when a table row is hovered.
     * rowNumber is the row number of the hovered row.
     */
    onRowHover: _react2.default.PropTypes.func,

    /**
     * @ignore
     * Called when a table row is no longer hovered.
     * rowNumber is the row number of the row that is no longer hovered.
     */
    onRowHoverExit: _react2.default.PropTypes.func,

    /**
     * Number to identify the row. This property is
     * automatically populated when used with the TableBody component.
     */
    rowNumber: _react2.default.PropTypes.number,

    /**
     * If true, table rows can be selected. If multiple row
     * selection is desired, enable multiSelectable.
     * The default value is true.
     */
    selectable: _react2.default.PropTypes.bool,

    /**
     * Indicates that a particular row is selected.
     * This property can be used to programmatically select rows.
     */
    selected: _react2.default.PropTypes.bool,

    /**
     * Indicates whether or not the row is striped.
     */
    striped: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      displayBorder: true,
      hoverable: false,
      hovered: false,
      selectable: true,
      selected: false,
      striped: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)(),
      hovered: false
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
  _onRowClick: function _onRowClick(event) {
    if (this.props.selectable && this.props.onRowClick) this.props.onRowClick(event, this.props.rowNumber);
  },
  _onRowHover: function _onRowHover(event) {
    if (this.props.onRowHover) this.props.onRowHover(event, this.props.rowNumber);
  },
  _onRowHoverExit: function _onRowHoverExit(event) {
    if (this.props.onRowHoverExit) this.props.onRowHoverExit(event, this.props.rowNumber);
  },
  _onCellClick: function _onCellClick(event, columnIndex) {
    if (this.props.selectable && this.props.onCellClick) {
      this.props.onCellClick(event, this.props.rowNumber, columnIndex);
    }
    event.ctrlKey = true;
    this._onRowClick(event);
  },
  _onCellHover: function _onCellHover(event, columnIndex) {
    if (this.props.hoverable) {
      this.setState({ hovered: true });
      if (this.props.onCellHover) this.props.onCellHover(event, this.props.rowNumber, columnIndex);
      this._onRowHover(event);
    }
  },
  _onCellHoverExit: function _onCellHoverExit(event, columnIndex) {
    if (this.props.hoverable) {
      this.setState({ hovered: false });
      if (this.props.onCellHoverExit) this.props.onCellHoverExit(event, this.props.rowNumber, columnIndex);
      this._onRowHoverExit(event);
    }
  },
  render: function render() {
    var _this = this;

    var _props = this.props;
    var className = _props.className;
    var displayBorder = _props.displayBorder;
    var hoverable = _props.hoverable;
    var onCellClick = _props.onCellClick;
    var onCellHover = _props.onCellHover;
    var onCellHoverExit = _props.onCellHoverExit;
    var onRowClick = _props.onRowClick;
    var onRowHover = _props.onRowHover;
    var onRowHoverExit = _props.onRowHoverExit;
    var rowNumber = _props.rowNumber;
    var selectable = _props.selectable;
    var selected = _props.selected;
    var striped = _props.striped;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['className', 'displayBorder', 'hoverable', 'onCellClick', 'onCellHover', 'onCellHoverExit', 'onRowClick', 'onRowHover', 'onRowHoverExit', 'rowNumber', 'selectable', 'selected', 'striped', 'style']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var rowColumns = _react2.default.Children.map(this.props.children, function (child, columnNumber) {
      if (_react2.default.isValidElement(child)) {
        return _react2.default.cloneElement(child, {
          columnNumber: columnNumber,
          hoverable: _this.props.hoverable,
          key: child.props.key || _this.props.rowNumber + '-' + columnNumber,
          onClick: _this._onCellClick,
          onHover: _this._onCellHover,
          onHoverExit: _this._onCellHoverExit,
          style: (0, _simpleAssign2.default)({}, styles.cell, child.props.style)
        });
      }
    });

    return _react2.default.createElement(
      'tr',
      _extends({
        className: className,
        style: prepareStyles((0, _simpleAssign2.default)(styles.root, style))
      }, other),
      rowColumns
    );
  }
});

exports.default = TableRow;