import {fromJS, Map, List} from 'immutable';

function findItemIndex(state, itemId) {
  return state.get('todos').findIndex(
    (item) => item.get('id') === itemId
  );
}

function setState(state, newState) {
  return state.merge(newState);
}

function toggleComplete(state, itemId) {
  const itemIndex = findItemIndex(state, itemId);
  const updatedItem = state.get('todos')
    .get(itemIndex)
    .update('status', status => status === 'active' ? 'completed' : 'active');

  return state.update('todos', todos => todos.set(itemIndex, updatedItem));
}

function changeFilter(state, filter) {
  return state.set('filter', filter);
}

function editItem(state, itemId) {
  const itemIndex = findItemIndex(state, itemId);
  const updatedItem = state.get('todos')
    .get(itemIndex)
    .set('editing', true);

  return state.update('todos', todos => todos.set(itemIndex, updatedItem));
}

function cancelEditing(state, itemId) {
  const itemIndex = findItemIndex(state, itemId);
  const updatedItem = state.get('todos')
    .get(itemIndex)
    .set('editing', false);

  return state.update('todos', todos => todos.set(itemIndex, updatedItem));
}

function doneEditing(state, itemId, newText) {
  const itemIndex = findItemIndex(state, itemId);
  const updatedItem = state.get('todos')
    .get(itemIndex)
    .set('editing', false)
    .set('text', newText);

  return state.update('todos', todos => todos.set(itemIndex, updatedItem));
}

function addItem(state, text, nextId) {
  const newItem = Map({id: nextId, text: text, status: 'active'});

  return state.withMutations(function (mutState) {
    mutState.update('todos', (todos) => todos.push(newItem))
            .set('nextId', nextId + 1);
  });
}

function deleteItem(state, itemId) {
  return state.update('todos',
    (todos) => todos.filterNot(
      (item) => item.get('id') === itemId
    )
  );
}

function addAllItems(state, todos) {
  const initState = state.set('todos', fromJS(todos));

  const nextId = initState.get('todos').reduce((maxId, item) => Math.max(maxId,item.get('id')), 0) + 1;
  return initState.set('nextId', nextId);
}

export default function(state = Map(), action) {
  switch (action.type) {
    case 'SET_STATE':
      return setState(state, action.state);
    case 'TOGGLE_COMPLETE':
      return toggleComplete(state, action.itemId);
    case 'CHANGE_FILTER':
      return changeFilter(state, action.filter);
    case 'EDIT_ITEM':
      return editItem(state, action.itemId);
    case 'CANCEL_EDITING':
      return cancelEditing(state, action.itemId);
    case 'DONE_EDITING':
      return doneEditing(state, action.itemId, action.newText);
    case 'ADD_ITEM':
      return addItem(state, action.text, action.nextId);
    case 'DELETE_ITEM':
      return deleteItem(state, action.itemId);
    case 'ADD_ALL_ITEMS':
      return addAllItems(state, action.todos);
  }
  return state;
}



