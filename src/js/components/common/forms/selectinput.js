import React from 'react';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

export default class SelectInput extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      value: this.props.value
    };
  }

  componentDidMount() {
    this.props.attachToForm(this); // Attaching the component to the form
  }
  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
  }

  setValue(value) {
    this.setState({ value });
    this.props.onChange(value);
  }

  render() {
    var menuItems = this.props.menuItems.reduce(
      (accu, item, index) => {
        accu.push(
          <MenuItem key={index} value={item.value}>
            {item.label}
          </MenuItem>
        );
        return accu;
      },
      [
        <MenuItem key="selection-placeholder" value="" disabled>
          {this.props.hint}
        </MenuItem>
      ]
    );

    return (
      <FormControl>
        <InputLabel htmlFor="simple-select">{this.props.label}</InputLabel>
        <Select
          id={this.props.id}
          name={this.props.id}
          value={this.state.value || this.props.value || this.props.default}
          onChange={event => this.setValue(event.target.value)}
          inputProps={{
            name: 'selector',
            id: 'simple-select'
          }}
          style={this.props.style}
        >
          {menuItems}
        </Select>
        {this.props.extraHint ? (
          <FormHelperText className="info" style={{ width: '500px' }}>
            {this.props.extraHint}
          </FormHelperText>
        ) : null}
      </FormControl>
    );
  }
}
