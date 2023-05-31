// Copyright 2022 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

// material ui
import { Clear as ClearIcon, DragHandle as DragHandleIcon } from '@mui/icons-material';
import { DialogContent, FormControl, FormHelperText, IconButton, ListItem } from '@mui/material';

import { ATTRIBUTE_SCOPES } from '../../../constants/deviceConstants';
import { defaultHeaders } from '../base-devices';
import AttributeAutoComplete from '../widgets/attribute-autocomplete';

const DraggableListItem = ({ item, index, onRemove }) => {
  const title = useMemo(() => {
    const header = Object.values(defaultHeaders).find(thing => thing.attribute === item.key);
    return item.title || header?.title || item.key;
  }, [item]);

  const onClick = () => onRemove(item, index);

  return (
    <Draggable draggableId={item.key} index={index}>
      {provided => (
        <ListItem className="flexbox space-between margin-right-large" ref={provided.innerRef} {...provided.draggableProps}>
          <div>{title}</div>
          <div className="flexbox space-between" style={{ width: 80 }}>
            <div {...provided.dragHandleProps} className="flexbox centered">
              <DragHandleIcon />
            </div>
            <IconButton onClick={onClick} size="small">
              <ClearIcon color="disabled" />
            </IconButton>
          </div>
        </ListItem>
      )}
    </Draggable>
  );
};

const columnLimit = 5;

const filterAttributes = (list, attribute) => list.filter(item => !(item.key === attribute.key && item.scope === attribute.scope));

const Content = ({ attributes, buttonRef, columnHeaders, idAttribute, selectedAttributes, setSelectedAttributes, ...props }) => {
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [isAtColumnLimit, setIsAtColumnLimit] = useState(selectedAttributes.length >= columnLimit);

  useEffect(() => {
    const { attributeOptions, selectedAttributes } = columnHeaders.reduce(
      (accu, { attribute, title }, index) => {
        // we skip the first/ id column + exclude the status column from customization
        if (index && attribute.name && !(attribute.name === 'status' && attribute.scope === ATTRIBUTE_SCOPES.identity)) {
          const currentAttribute = { ...attribute, key: attribute.name, id: `${attribute.scope}-${attribute.name}`, title };
          accu.selectedAttributes.push(currentAttribute);
          accu.attributeOptions = filterAttributes(accu.attributeOptions, currentAttribute);
        }
        return accu;
      },
      {
        attributeOptions: [...attributes.filter(item => !([idAttribute, 'status'].includes(item.key) && item.scope === ATTRIBUTE_SCOPES.identity))],
        selectedAttributes: []
      }
    );
    setSelectedAttributes(selectedAttributes);
    setAttributeOptions(attributeOptions);
  }, [attributes, columnHeaders]);

  useEffect(() => {
    const isAtColumnLimit = selectedAttributes.length >= columnLimit;
    if (isAtColumnLimit && buttonRef.current) {
      buttonRef.current.focus();
    }
    setIsAtColumnLimit(isAtColumnLimit);
  }, [selectedAttributes.length]);

  const onDragEnd = ({ destination, source }) => {
    if (!destination) {
      return;
    }
    const result = [...selectedAttributes];
    const [removed] = result.splice(source.index, 1);
    result.splice(destination.index, 0, removed);
    setSelectedAttributes(result);
  };

  const onRemove = (attribute, index) => {
    let selection = [];
    let removed = attribute;
    if (index !== undefined) {
      selection = [...selectedAttributes];
      const [removedAttribute] = selection.splice(index, 1);
      removed = removedAttribute;
    } else {
      selection = filterAttributes(selectedAttributes, attribute);
    }
    setSelectedAttributes(selection);
    setAttributeOptions([...attributeOptions, removed]);
  };

  const onSelect = attribute => {
    if (attribute.key) {
      const existingAttribute = attributeOptions.find(item => item.key === attribute.key && item.scope === attribute.scope) || attribute;
      setSelectedAttributes([
        ...selectedAttributes,
        { ...existingAttribute, title: existingAttribute.value ?? existingAttribute.key, id: `${attribute.scope}-${attribute.key}` }
      ]);
      setAttributeOptions(filterAttributes(attributeOptions, attribute));
    }
  };

  return (
    <DialogContent>
      <p>You can select up to 5 columns of inventory data to display in the device list table. Drag to change the order.</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-list" direction="vertical">
          {provided => {
            return (
              <div ref={provided.innerRef} {...provided.droppableProps} {...props}>
                {selectedAttributes.map((item, index) => (
                  <DraggableListItem item={item} index={index} key={item.key} onRemove={onRemove} />
                ))}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
      <FormControl>
        <AttributeAutoComplete attributes={attributeOptions} disabled={isAtColumnLimit} label="Add a column" onRemove={onRemove} onSelect={onSelect} />
        {isAtColumnLimit && <FormHelperText>Maximum of {columnLimit} reached</FormHelperText>}
      </FormControl>
    </DialogContent>
  );
};

export default Content;
