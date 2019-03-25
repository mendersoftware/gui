import React from 'react';

// material ui
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

export default class ExpandableDeviceAttribute extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expanded: false
    };
  }

  render() {
    const self = this;
    const { primary, secondary, classes, textClasses } = self.props;
    const defaultClasses = { root: 'attributes', disabled: 'opaque' };
    const currentTextClasses = { secondary: `${textClasses ? textClasses.secondary : ''} ${self.state.expanded ? 'expanded' : ''}` };
    return (
      <div onClick={() => self.setState({ expanded: !self.state.expanded })}>
        <ListItem classes={classes || defaultClasses} disabled={true}>
          <ListItemText classes={currentTextClasses} primary={primary} secondary={secondary} secondaryTypographyProps={{ title: secondary }} />
        </ListItem>
        <Divider />
      </div>
    );
  }
}
