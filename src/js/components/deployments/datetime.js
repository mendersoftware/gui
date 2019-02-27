import React from 'react';

// material ui
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

export default class DateTime extends React.Component {
  _update(e, date) {
    this.props.changed(this.props.my_ref, date);
  }
  render() {
    var element = <div />;
    if (this.props.date) {
      element = (
        <DatePicker
          floatingLabelText={this.props.label}
          autoOk={true}
          ref={this.props.ref}
          defaultDate={this.props.defaultDate}
          minDate={this.props.minDate}
          mode="landscape"
          onChange={this._update}
        />
      );
    } else if (this.props.time) {
      element = (
        <TimePicker format="24hr" ref={this.props.ref} defaultTime={this.props.defaultDate} floatingLabelText={this.props.label} onChange={this._update} />
      );
    }
    return <div>{element}</div>;
  }
}
