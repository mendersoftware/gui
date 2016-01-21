import React from 'react';

// material ui
var mui = require('material-ui');
var DatePicker = mui.DatePicker;
var TimePicker = mui.TimePicker;

var DateTime = React.createClass({
  _update: function(e, date) {
    this.props.changed(this.props.my_ref, date);
  },
  render: function() {
    var element = (
      <div/>
    );
    if (this.props.date) {
      element = (
        <DatePicker
          floatingLabelText={this.props.label}
          autoOk={true}
          ref={this.props.ref}
          defaultDate={this.props.defaultDate}
          minDate={this.props.minDate}
          mode="landscape"
          onChange={this._update} />
      )
    } else if (this.props.time) {
      element = (
        <TimePicker
        format="24hr"
        ref={this.props.ref}
        defaultTime={this.props.defaultDate}
        floatingLabelText={this.props.label}
        onChange={this._update} />
      )
    }
    return (
      <div>
        {element}
      </div>
    );
  }
});

module.exports = DateTime;