import React from 'react';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class SelectInput extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      value: this.props.value
    };
  }

  componentWillMount() {
    this.props.attachToForm(this); // Attaching the component to the form
  }
  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
  }

  setValue(value) {
    this.setState({
      value: value
    });
    this.props.onChange(value);
  }

  render() {
    var menuItems = this.props.menuItems.map((item, index) => {
      return <MenuItem key={index} value={item.value} primaryText={item.label} />;
    }, this);

    return (
      <div>
        <SelectField
          id={this.props.id}
          name={this.props.id}
          defaultValue={this.props.default}
          value={this.props.value}
          hintText={this.props.hint}
          floatingLabelText={this.props.label}
          onChange={(event, target, value) => this.setValue(value)}
          errorStyle={{ color: 'rgb(171, 16, 0)' }}
          style={this.props.style}
        >
          {menuItems}
        </SelectField>
        {this.props.extraHint ? (
          <p className="info" style={{ width: '500px' }}>
            {this.props.extraHint}
          </p>
        ) : null}
      </div>
    );
  }
}
