'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');
var StylePropable = require('../mixins/style-propable');
var DateTime = require('../utils/date-time');
var Transitions = require('../styles/transitions');
var AutoPrefix = require('../styles/auto-prefix');
var SlideInTransitionGroup = require('../transition-groups/slide-in');
var DefaultRawTheme = require('../styles/raw-themes/light-raw-theme');
var ThemeManager = require('../styles/theme-manager');

var DateDisplay = React.createClass({
  displayName: 'DateDisplay',

  mixins: [StylePropable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    disableYearSelection: React.PropTypes.bool,
    monthDaySelected: React.PropTypes.bool,
    selectedDate: React.PropTypes.object.isRequired,
    weekCount: React.PropTypes.number
  },

  //for passing default theme context to children
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
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
      transitionDirection: 'up',
      muiTheme: this.context.muiTheme ? this.context.muiTheme : ThemeManager.getMuiTheme(DefaultRawTheme)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({ muiTheme: newMuiTheme });

    var direction = undefined;

    if (nextProps.selectedDate !== this.props.selectedDate) {
      direction = nextProps.selectedDate > this.props.selectedDate ? 'up' : 'down';
      this.setState({
        transitionDirection: direction
      });
    }

    if (nextProps.monthDaySelected !== undefined) {
      this.setState({ selectedYear: !nextProps.monthDaySelected });
    }
  },

  getTheme: function getTheme() {
    return this.state.muiTheme.datePicker;
  },

  getStyles: function getStyles() {
    var theme = this.getTheme();
    var isLandscape = this.props.mode === 'landscape';

    var styles = {
      root: {
        backgroundColor: theme.selectColor,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        color: theme.textColor,
        height: 60,
        padding: 20
      },

      month: {
        display: isLandscape ? 'block' : undefined,
        marginLeft: isLandscape ? undefined : 8,
        marginTop: isLandscape ? 5 : undefined
      },

      monthDay: {
        root: {
          display: 'inline-block',
          fontSize: 36,
          fontWeight: '400',
          lineHeight: '36px',
          height: isLandscape ? 76 : 38,
          opacity: this.state.selectedYear ? 0.7 : 1.0,
          transition: Transitions.easeOut(),
          width: '100%'
        },

        title: {
          cursor: !this.state.selectedYear ? 'default' : 'pointer'
        }
      },

      year: {
        root: {
          margin: 0,
          fontSize: 16,
          fontWeight: '400',
          lineHeight: '16px',
          height: 16,
          opacity: this.state.selectedYear ? 1.0 : 0.7,
          transition: Transitions.easeOut(),
          marginBottom: 10
        },

        title: {
          cursor: this.state.selectedYear && !this.props.disableYearSelection ? 'pointer' : 'default'
        }
      }
    };

    return styles;
  },

  render: function render() {
    var _props = this.props;
    var selectedDate = _props.selectedDate;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['selectedDate', 'style']);

    var dayOfWeek = DateTime.getDayOfWeek(this.props.selectedDate);
    var month = DateTime.getShortMonth(this.props.selectedDate);
    var day = this.props.selectedDate.getDate();
    var year = this.props.selectedDate.getFullYear();
    var styles = this.getStyles();

    return React.createElement(
      'div',
      _extends({}, other, { style: this.mergeAndPrefix(styles.root, this.props.style) }),
      React.createElement(
        SlideInTransitionGroup,
        {
          style: styles.year.root,
          direction: this.state.transitionDirection },
        React.createElement(
          'div',
          { key: year, style: styles.year.title, onTouchTap: this._handleYearClick },
          year
        )
      ),
      React.createElement(
        SlideInTransitionGroup,
        {
          style: styles.monthDay.root,
          direction: this.state.transitionDirection },
        React.createElement(
          'div',
          {
            key: dayOfWeek + month + day,
            style: styles.monthDay.title,
            onTouchTap: this._handleMonthDayClick },
          React.createElement(
            'span',
            null,
            dayOfWeek,
            ','
          ),
          React.createElement(
            'span',
            { style: styles.month },
            month,
            ' ',
            day
          )
        )
      )
    );
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
  }

});

module.exports = DateDisplay;