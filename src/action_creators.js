import fetch from 'isomorphic-fetch'

const http = require('http');   // From node.js: For response code string lookups

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

// TODO: Use the following two functions to
// update a spinner/in-progress UI element
export function fetchingData() {
  return {
    type: 'START_FETCHING'
  };
}

export function doneFetchingData() {
  return {
    type: 'COMPLETED_FETCHING'
  };
}

export function toggleComplete(itemId) {
  return (dispatch, getState) => {
    dispatch(fetchingData);

    const todo = getState().get('todos').find(match => {return match.get('id') === itemId; });

    var newStatus = todo.get('status') === 'active' ? 'completed' : 'active';

    return fetch(`http://localhost:8080/todos/${itemId}`, {
                  method: "PUT",
                  body: JSON.stringify(todo.set('status', newStatus)),
                  headers: {
                    "Content-Type": "application/json"
                  },
                }).then(handleErrors)
                .then(response =>
                  dispatch(doneFetchingData()),
                  dispatch(storeToggleComplete(itemId))
                ).catch(error => {
                  console.error("While attempting toggleComplete - " + errStr);
                })
  };
}

export function storeToggleComplete(itemId) {
  return {
    type: 'TOGGLE_COMPLETE',
    itemId
  }
}

export function changeFilter(filter) {
  return dispatch => {
    dispatch(fetchingData);
    return fetch(`http://localhost:8080/view/${filter}`, {
                  method: "PUT",
                  headers: {
                      "Content-Type": "application/json"
                  },
                }).then(handleErrors)
                .then(response =>
                  dispatch(doneFetchingData()),
                  dispatch(storeChangeFilter(filter))
                ).catch(error => {
                  console.error("While attempting changeFilter - " + errStr);
                })
  };
}

export function storeChangeFilter(filter) {
  return {
    type: 'CHANGE_FILTER',
    filter
  }
}

export function editItem(itemId) {
  return {
    type: 'EDIT_ITEM',
    itemId
  }
}

export function doneEditing(itemId, newText) {
  return (dispatch, getState) => {
    dispatch(fetchingData);

    const todo = getState().get('todos').find(match => {return match.get('id') === itemId; });

    return fetch(`http://localhost:8080/todos/${itemId}`, {
                  method: "PUT",
                  body: JSON.stringify(todo.set('text', newText)),
                  headers: {
                      "Content-Type": "application/json"
                  },
                }).then(handleErrors)
                .then(response =>
                  dispatch(doneFetchingData()),
                  dispatch(storeEditing(itemId, newText))
                ).catch(error => {
                  console.error("While attempting changeFilter - " + errStr);
                })
  };
}

export function storeEditing(itemId, newText) {
  return {
    type: 'DONE_EDITING',
    itemId,
    newText
  }
}

export function cancelEditing(itemId) {
  return {
    type: 'CANCEL_EDITING',
    itemId
  }
}

export function clearCompleted() {
  return dispatch => {
    dispatch(fetchingData);
    return fetch(`http://localhost:8080/todosbystat/completed`, {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json"
                  },
                }).then(handleErrors)
                .then(response =>
                  dispatch(doneFetchingData()),
                ). then(() =>
                  dispatch(loadTodos())
                ).catch(error => {
                  console.error("While attempting clearCompleted - " + errStr);
                })
  };
}

export function deleteItem(itemId) {
  return dispatch => {
    dispatch(fetchingData);
    return fetch(`http://localhost:8080/todos/${itemId}`, {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json"
                  },
                }).then(handleErrors)
                .then(response =>
                  dispatch(doneFetchingData()),
                  dispatch(storeDeleteItem(itemId))
                ).catch(error => {
                  console.error("While attempting deleteItem - " + errStr);
                })
  };
}

export function storeDeleteItem(itemId) {
  return {
    type: 'DELETE_ITEM',
    itemId
  }
}

export function addItem(text) {
  return (dispatch, getState) => {
    dispatch(fetchingData);
    const nextId = getState().get('nextId');
    const newItem = {id: nextId, text: text, status: 'active'};
    return fetch(`http://localhost:8080/todos`, {
                  method: "POST",
                  body: JSON.stringify(newItem),
                  headers: {
                    "Content-Type": "application/json"
                  },
                }).then(handleErrors)
                .then(response =>
                  dispatch(doneFetchingData()),
                  dispatch(storeAddItem(text, nextId))
                ).catch(error => {
                  console.error("While attempting deleteItem - " + errStr);
                })
  };
}

export function storeAddItem(text, nextId) {
  return {
    type: 'ADD_ITEM',
    text,
    nextId
  }
}

export function loadChangeFilter() {
  return dispatch => {
    return fetch(`http://localhost:8080/view`, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json"
                  },
                }).then(handleErrors)
                .then(response => response.json()).then (json => {
                  dispatch(storeChangeFilter(json.view));
                }).catch(error => {
                  var errStr = String(error);
                  if (!errStr.includes(http.STATUS_CODES[404])) {
                    console.error("While attempting loadChangeFilter - " + errStr);
                  }
                  dispatch(storeChangeFilter('all'));
                })
  };
}

export function addAllItems(todos) {
  return {
    type: 'ADD_ALL_ITEMS',
    todos
  }
}

export function loadTodos() {
  return dispatch => {
    return fetch(`http://localhost:8080/todos`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json"
                  },
                }).then(handleErrors)
                .then(response => response.json()).then (json => {
                  dispatch(addAllItems(json));
                }).catch(error => {
                  var errStr = String(error);
                  if (errStr.includes(http.STATUS_CODES[404])) {
                    const initJson = [];
                    dispatch(addAllItems(initJson));
                  } else {
                    console.error("While attempting loadTodos - " + errStr);
                  }
                })
  };
}

export function initApp() {
  return (dispatch) => {
    dispatch(loadTodos());
    dispatch(loadChangeFilter());
  };
}