import React from 'react';
import ReactDOM from 'react-dom';
import {List, Map} from 'immutable';
import {compose, createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import {TodoAppContainer} from './components/TodoApp';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {initApp} from './action_creators';

import 'todomvc-app-css/index.css';

const store = createStore(
    reducer,
    composeWithDevTools(
        applyMiddleware(
            thunkMiddleware // lets us dispatch() functions
        )
    )
);

store.dispatch(initApp());

ReactDOM.render(
  <Provider store={store}>
    <TodoAppContainer />
  </Provider>,
  document.getElementById('app')
);
