'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _slideIn = require('../transition-groups/slide-in');

var _slideIn2 = _interopRequireDefault(_slideIn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var datePicker = props.muiTheme.datePicker;
  var selectedYear = state.selectedYear;


  var styles = {
    root: {
      backgroundColor: datePicker.selectColor,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
      color: datePicker.textColor,
      height: 60,
      padding: 20
    },
    monthDay: {
      display: 'inline-block',
      fontSize: 36,
      fontWeight: '400',
      lineHeight: '36px',
      height: props.mode === 'landscape' ? 76 : 38,
      opacity: selectedYear ? 0.7 : 1,
      transition: _transitions2.default.easeOut(),
      width: '100%'
    },
    monthDayTitle: {
      cursor: !selectedYear ? 'default' : 'pointer'
    },
    year: {
      margin: 0,
      fontSize: 16,
      fontWeight: '400',
      lineHeight: '16px',
      height: 16,
      opacity: selectedYear ? 1 : 0.7,
      transition: _transitions2.default.easeOut(),
      marginBottom: 10
    },
    yearTitle: {
      cursor: !selectedYear && !props.disableYearSelection ? 'pointer' : 'default'
    }
  };

  return styles;
}

var DateDisplay = _react2.default.createClass({
  displayName: 'DateDisplay',


  propTypes: {
    DateTimeFormat: _react2.default.PropTypes.func.isRequired,
    disableYearSelection: _react2.default.PropTypes.bool,
    handleMonthDayClick: _react2.default.PropTypes.func,
    handleYearClick: _react2.default.PropTypes.func,
    locale: _react2.default.PropTypes.string.isRequired,
    mode: _react2.default.PropTypes.oneOf(['portrait', 'landscape']),
    monthDaySelected: _react2.default.PropTypes.bool,

    /**
     * @ignore
     * The material-ui theme applied to this component.
     */
    muiTheme: _react2.default.PropTypes.object.isRequired,

    selectedDate: _react2.default.PropTypes.object.isRequired,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,
    weekCount: _react2.default.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      disableYearSelection: false,
      monthDaySelected: true,
      weekCount: 4
    };
  },
  getInitialState: function getInitialState() {
    return {
      selectedYear: !this.props.monthDaySelected,
      transitionDirection: 'up'
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.selectedDate !== this.props.selectedDate) {
      var direction = nextProps.selectedDate > this.props.selectedDate ? 'up' : 'down';
      this.setState({
        transitionDirection: direction
      });
    }

    if (nextProps.monthDaySelected !== undefined) {
      this.setState({
        selectedYear: !nextProps.monthDaySelected
      });
    }
  },
  _handleMonthDayClick: function _handleMonthDayClick() {
    if (this.props.handleMonthDayClick && this.state.selectedYear) {
      this.props.handleMonthDayClick();
    }

    this.setState({ selectedYear: false });
  },
  _handleYearClick: function _handleYearClick() {
    if (this.props.handleYearClick && !this.props.disableYearSelection && !this.state.selectedYear) {
      this.props.handleYearClick();
    }

    if (!this.props.disableYearSelection) {
      this.setState({ selectedYear: true });
    }
  },
  render: function render() {
    var _props = this.props;
    var DateTimeFormat = _props.DateTimeFormat;
    var locale = _props.locale;
    var selectedDate = _props.selectedDate;
    var style = _props.style;
    var prepareStyles = _props.muiTheme.prepareStyles;

    var other = _objectWithoutProperties(_props, ['DateTimeFormat', 'locale', 'selectedDate', 'style', 'muiTheme']);

    var year = selectedDate.getFullYear();
    var styles = getStyles(this.props, this.state);

    var dateTimeFormatted = new DateTimeFormat(locale, {
      month: 'short',
      weekday: 'short',
      day: '2-digit'
    }).format(selectedDate);

    return _react2.default.createElement(
      'div',
      _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)) }),
      _react2.default.createElement(
        _slideIn2.default,
        {
          style: styles.year,
          direction: this.state.transitionDirection
        },
        _react2.default.createElement(
          'div',
          { key: year, style: styles.yearTitle, onTouchTap: this._handleYearClick },
          year
        )
      ),
      _react2.default.createElement(
        _slideIn2.default,
        {
          style: styles.monthDay,
          direction: this.state.transitionDirection
        },
        _react2.default.createElement(
          'div',
          {
            key: dateTimeFormatted,
            style: styles.monthDayTitle,
            onTouchTap: this._handleMonthDayClick
          },
          dateTimeFormatted
        )
      )
    );
  }
});

exports.default = DateDisplay;