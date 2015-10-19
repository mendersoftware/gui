var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var mui = require('material-ui');

var DatePicker = mui.DatePicker;
var TimePicker = mui.TimePicker;
var SelectField = mui.SelectField;
var RadioButtonGroup = mui.RadioButtonGroup;
var RadioButton = mui.RadioButton;
var Dialog = mui.Dialog;
var RaisedButton = mui.RaisedButton;

function getDate() {
  return new Date()
}

function addDate(date,days) {
  var newDate = new Date(date);
  newDate.setDate(newDate.getDate()+1);
  return newDate;
}

var ScheduleForm = React.createClass({
  getInitialState: function() {
    return {
      minDate: getDate(),
      minDate1: addDate(getDate(),1)
    };
  },
  dialogDismiss: function(ref) {
    this.refs[ref].dismiss();
  },
  dialogOpen: function(ref) {
    this.refs[ref].show();
  },
  _handleGroupValueChange: function(e) {

    var group = this.props.groups[e.target.value-1];
        console.log("group", group, e.target.value);
    this.setState({
      group: group,
    });
  },
  _handleImageValueChange: function(e) {
    var image = this.props.images[e.target.value-1];
            console.log("image", image, e.target.value);
    this.setState({
      image: image,
    });
  },
  _onDialogSubmit: function() {
    var newUpdate = {};
    newUpdate.image = this.state.image;
    newUpdate.group = this.state.group;
    newUpdate.start_time = this.refs['time'].getTime().getTime();
    newUpdate.end_time = this.refs['endtime'].getTime().getTime();
    newUpdate.start_date = this.refs['date'].getDate();
    newUpdate.end_date = this.refs['enddate'].getDate();

    AppActions.saveSchedule(newUpdate);

    this.dialogDismiss('schedule');

  },

  render: function() {
    var imageItems = [];
    for (var i=0; i<this.props.images.length;i++) {
      var tmp = { payload:this.props.images[i].id, text: this.props.images[i].name };
      imageItems.push(tmp);
    }

    var groupItems = [];
    for (var i=0; i<this.props.groups.length;i++) {
      var tmp = { payload:this.props.groups[i].id, text: this.props.groups[i].name };
      groupItems.push(tmp);
    }
    var actions = [
      { text: 'Cancel', onClick: this.dialogDismiss.bind(null, 'schedule')},
      { text: 'Schedule update', onClick: this._onDialogSubmit, ref: 'save' }
    ];
    return (
      <div>
        <RaisedButton primary={true} label="Schedule an update" onClick={this.dialogOpen.bind(null, 'schedule')} />
        <Dialog
          ref="schedule"
          title="Schedule an update"
          actions={actions}
          actionFocus="submit"
          autoDetectWindowHeight={true} autoScrollBodyContent={true}

          >
          <div style={{height: '400px'}}>
            <form>
              <div style={{display:"inline-block"}}>
                <DatePicker
                  floatingLabelText="Start date"
                  autoOk={true}
                  ref="date"
                  defaultDate={this.state.minDate}
                  minDate={this.state.minDate}
                  disabled={this.state.immediate}
                  mode="landscape"/>

                <TimePicker
                  format="24hr"
                  ref="time"
                  defaultTime={this.state.minDate}
                  disabled={this.state.immediate}
                  floatingLabelText="Start time" />
              </div>
              <div style={{display:"inline-block", marginLeft:"30px"}}>
                <DatePicker
                  floatingLabelText="End date"
                  autoOk={true}
                  ref="enddate"
                  defaultDate={this.state.minDate1}
                  minDate={this.state.minDate1}
                  disabled={this.state.immediate}
                  mode="landscape"/>

                <TimePicker
                  format="24hr"
                  ref="endtime"
                  defaultTime={this.state.minDate1}
                  disabled={this.state.immediate}
                  floatingLabelText="End time" />
              </div>
              <SelectField
                ref="image"
                value={this.state.image}
                onChange={this._handleImageValueChange}
                floatingLabelText="Select software image"
                menuItems={imageItems} />

              <SelectField
                style={{display:"block"}}
                value={this.state.group}
                ref="group"
                onChange={this._handleGroupValueChange}
                floatingLabelText="Select group"
                menuItems={groupItems} />

            </form>
          </div>
        </Dialog>
      </div>
    );
  }
});


module.exports = ScheduleForm;