'use strict';

var React = require('react');
var DateTime = require('../utils/date-time');
var IconButton = require('../icon-button');
var Toolbar = require('../toolbar/toolbar');
var ToolbarGroup = require('../toolbar/toolbar-group');
var NavigationChevronLeft = require('../svg-icons/navigation/chevron-left');
var NavigationChevronRight = require('../svg-icons/navigation/chevron-right');
var SlideInTransitionGroup = require('../transition-groups/slide-in');

var CalendarToolbar = React.createClass({
  displayName: 'CalendarToolbar',

  propTypes: {
    displayDate: React.PropTypes.object.isRequired,
    nextMonth: React.PropTypes.bool,
    onMonthChange: React.PropTypes.func,
    prevMonth: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      nextMonth: true,
      prevMonth: true
    };
  },

  getInitialState: function getInitialState() {
    return {
      transitionDirection: 'up'
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var direction = undefined;

    if (nextProps.displayDate !== this.props.displayDate) {
      direction = nextProps.displayDate > this.props.displayDate ? 'up' : 'down';
      this.setState({
        transitionDirection: direction
      });
    }
  },

  _styles: function _styles() {
    return {
      root: {
        position: 'relative',
        padding: 0,
        backgroundColor: 'inherit'
      },

      title: {
        position: 'absolute',
        top: '17px',
        lineHeight: '14px',
        fontSize: '14px',
        height: '14px',
        width: '100%',
        fontWeight: '500',
        textAlign: 'center'
      }
    };
  },

  render: function render() {
    var month = DateTime.getFullMonth(this.props.displayDate);
    var year = this.props.displayDate.getFullYear();
    var styles = this._styles();

    return React.createElement(
      Toolbar,
      { className: 'mui-date-picker-calendar-toolbar', style: styles.root, noGutter: true },
      React.createElement(
        SlideInTransitionGroup,
        {
          style: styles.title,
          direction: this.state.transitionDirection },
        React.createElement(
          'div',
          { key: month + '_' + year },
          month,
          ' ',
          year
        )
      ),
      React.createElement(
        ToolbarGroup,
        { key: 0, float: 'left' },
        React.createElement(
          IconButton,
          {
            style: styles.button,
            disabled: !this.props.prevMonth,
            onTouchTap: this._prevMonthTouchTap },
          React.createElement(NavigationChevronLeft, null)
        )
      ),
      React.createElement(
        ToolbarGroup,
        { key: 1, float: 'right' },
        React.createElement(
          IconButton,
          {
            style: styles.button,
            disabled: !this.props.nextMonth,
            onTouchTap: this._nextMonthTouchTap },
          React.createElement(NavigationChevronRight, null)
        )
      )
    );
  },

  _prevMonthTouchTap: function _prevMonthTouchTap() {
    if (this.props.onMonthChange && this.props.prevMonth) this.props.onMonthChange(-1);
  },

  _nextMonthTouchTap: function _nextMonthTouchTap() {
    if (this.props.onMonthChange && this.props.nextMonth) this.props.onMonthChange(1);
  }

});

module.exports = CalendarToolbar;