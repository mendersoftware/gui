import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { UNGROUPED_GROUP } from '../../../constants/deviceConstants';
import { getDocsVersion } from '../../../selectors';
import GroupDefinition from './group-definition';

export const CreateGroup = ({ addListOfDevices, docsVersion, groups, isCreation, isCreationDynamic, onClose, selectedDevices, selectedGroup }) => {
  const [invalid, setInvalid] = useState(true);
  const [isModification, setIsModification] = useState(!isCreation);
  const [newGroup, setNewGroup] = useState('');
  const [title, setTitle] = useState(isCreationDynamic ? 'Create a new group' : `Add ${selectedDevices.length ? 'selected ' : ''}devices to group`);

  const onNameChange = (isInvalid, newGroupName, isModification) => {
    const title = !isCreationDynamic ? `Add ${selectedDevices.length ? 'selected ' : ''}devices to group` : 'Create a new group';
    setTitle(title);
    setInvalid(isInvalid);
    setIsModification(isModification);
    setNewGroup(newGroupName);
  };

  return (
    <Dialog disableEscapeKeyDown open={true} scroll="paper" fullWidth={true} maxWidth="sm">
      <DialogTitle style={{ paddingBottom: '15px', marginBottom: 0 }}>{title}</DialogTitle>
      <DialogContent className="dialog">
        <GroupDefinition
          docsVersion={docsVersion}
          groups={groups}
          isCreationDynamic={isCreationDynamic}
          isModification={isModification}
          newGroup={newGroup}
          onInputChange={(invalidName, name, isModification) => onNameChange(invalidName, name, isModification)}
          selectedGroup={selectedGroup}
        />
      </DialogContent>
      <DialogActions style={{ marginTop: 0 }}>
        <Button style={{ marginRight: 10 }} onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={() => addListOfDevices(selectedDevices, newGroup)} disabled={!newGroup.length || invalid}>
          {!isModification || isCreationDynamic || groups.length === 0 ? 'Create group' : 'Add to group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state, ownProps) => {
  // ensure that existing dynamic groups are only listed if a dynamic group should be created
  const groups = Object.keys(state.devices.groups.byId).filter(group =>
    ownProps.fromFilters ? group !== UNGROUPED_GROUP.id : !state.devices.groups.byId[group].filters.length
  );
  return {
    docsVersion: getDocsVersion(state),
    groups,
    isCreationDynamic: ownProps.isCreation && ownProps.fromFilters,
    selectedGroup: state.devices.groups.selectedGroup
  };
};

export default connect(mapStateToProps)(CreateGroup);
