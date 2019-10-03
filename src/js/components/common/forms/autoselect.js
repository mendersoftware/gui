import React from 'react';
import { createFilter } from 'react-search-input';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Fade from '@material-ui/core/Fade';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

import CancelIcon from '@material-ui/icons/Cancel';

export default class AutoSelect extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      searchTerm: '',
      open: false
    };
    this.timeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  componentDidMount() {
    if (this.props.value) {
      this.setState({searchTerm: this.props.value});
    }
  }

  searchUpdated(searchTerm) {
    clearTimeout(this.timeout);
    const open = Boolean(searchTerm.length);
    this.setState({ open, searchTerm });
  }

  handleClose(searchTerm = '', item) {
    clearTimeout(this.timeout);
    this.setState({ open: false, searchTerm });
    this.props.onChange(item);
  }

  openDropdown() {
    const self = this;
    self.timeout = setTimeout(() => self.setState({ open: true }), 400);
  }

  render() {
    const self = this;
    const { open, searchTerm } = self.state;

    const filters = ['title', 'name', 'device_types_compatible', 'description'];
    const filter = createFilter(searchTerm, filters);
    const tmpItems = self.props.items.filter(filter);
    const items = tmpItems.map((item, index) => (
      <MenuItem key={index} onClick={() => self.handleClose(item.title, item.value)}>
        {item.title}
      </MenuItem>
    ));

    return (
      <FormControl className={self.props.className} style={self.props.style}>
        <InputLabel htmlFor="adornment-target-select">{self.props.label}</InputLabel>
        <Input
          id="adornment-target-select"
          type="text"
          inputRef={input => (self.anchorEl = input)}
          placeholder={self.props.placeholder || self.props.label}
          disabled={self.props.disabled}
          value={searchTerm}
          onChange={event => self.searchUpdated(event.target.value)}
          onFocus={() => self.openDropdown()}
          onBlur={() => self.openDropdown()}
          style={{ minWidth: '250px' }}
          endAdornment={
            searchTerm.length ? (
              <InputAdornment position="end">
                <IconButton onClick={() => self.handleClose()}>
                  <CancelIcon />
                </IconButton>
              </InputAdornment>
            ) : null
          }
        />
        <Popper open={open} anchorEl={self.anchorEl} transition style={{ zIndex: 1300 }} placement="bottom-start">
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper elevation={2}>
                <ClickAwayListener onClickAway={() => self.setState({ open: false })}>
                  <MenuList
                    style={{
                      overflow: 'auto',
                      maxHeight: '250px'
                    }}
                  >
                    {items}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </FormControl>
    );
  }
}
