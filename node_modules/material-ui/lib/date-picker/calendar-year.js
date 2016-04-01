'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _dateTime = require('../utils/date-time');

var _dateTime2 = _interopRequireDefault(_dateTime);

var _yearButton = require('./year-button');

var _yearButton2 = _interopRequireDefault(_yearButton);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CalendarYear = _react2.default.createClass({
  displayName: 'CalendarYear',


  propTypes: {
    displayDate: _react2.default.PropTypes.object.isRequired,
    maxDate: _react2.default.PropTypes.object,
    minDate: _react2.default.PropTypes.object,
    onYearTouchTap: _react2.default.PropTypes.func,
    selectedDate: _react2.default.PropTypes.object.isRequired
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    this._scrollToSelectedYear();
  },
  componentDidUpdate: function componentDidUpdate() {
    this._scrollToSelectedYear();
  },
  _getYears: function _getYears() {
    var minYear = this.props.minDate.getFullYear();
    var maxYear = this.props.maxDate.getFullYear();

    var years = [];
    var dateCheck = _dateTime2.default.clone(this.props.selectedDate);
    for (var year = minYear; year <= maxYear; year++) {
      dateCheck.setFullYear(year);
      var selected = this.props.selectedDate.getFullYear() === year;
      var selectedProps = {};
      if (selected) {
        selectedProps = { ref: 'selectedYearButton' };
      }

      var yearButton = _react2.default.createElement(_yearButton2.default, _extends({
        key: 'yb' + year,
        year: year,
        onTouchTap: this._handleYearTouchTap,
        selected: selected
      }, selectedProps));

      years.push(yearButton);
    }

    return years;
  },
  _scrollToSelectedYear: function _scrollToSelectedYear() {
    if (this.refs.selectedYearButton === undefined) return;

    var container = _reactDom2.default.findDOMNode(this);
    var yearButtonNode = _reactDom2.default.findDOMNode(this.refs.selectedYearButton);

    var containerHeight = container.clientHeight;
    var yearButtonNodeHeight = yearButtonNode.clientHeight || 32;

    var scrollYOffset = yearButtonNode.offsetTop + yearButtonNodeHeight / 2 - containerHeight / 2;
    container.scrollTop = scrollYOffset;
  },
  _handleYearTouchTap: function _handleYearTouchTap(event, year) {
    if (this.props.onYearTouchTap) this.props.onYearTouchTap(event, year);
  },
  render: function render() {
    var years = this._getYears();
    var backgroundColor = this.state.muiTheme.datePicker.calendarYearBackgroundColor;
    var styles = {
      position: 'relative',
      height: 'inherit',
      lineHeight: '36px',
      textAlign: 'center',
      padding: '8px 14px 0 14px',
      backgroundColor: backgroundColor,
      overflowX: 'hidden',
      overflowY: 'scroll'
    };

    return _react2.default.createElement(
      'div',
      { style: styles },
      years
    );
  }
});

exports.default = CalendarYear;