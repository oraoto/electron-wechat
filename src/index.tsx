import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { browserHistory } from 'react-router'
import { AppContainer } from 'react-hot-loader';
import promiseMiddleware from 'redux-promise-middleware';

import * as Config from './Config';
import App from './App';
import Reducers from './Reducers';
import WechatAdapter from './Reducers/Wechat/Adapter';
import WindowAdapter from './Reducers/Window/Adapter';

import 'antd/dist/antd.css';
import './style.css';

declare const window: any;

const composeEnhancers = Config.DEBUG ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose) : compose;

let middleware = composeEnhancers(
    applyMiddleware(
        promiseMiddleware()
    )
);

let store = createStore(Reducers, {}, middleware);
const history = syncHistoryWithStore(browserHistory, store)

const wechatAdapter = new WechatAdapter(store);
const windowAdapter = new WindowAdapter(store);

window.wechatAdapter = wechatAdapter;
window.router_root = location.pathname;


const render = (App) => {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <App history={history} />
            </Provider>
        </AppContainer>,
        document.getElementById('app')
    );
}

render(App);

declare const module: any;
if (Config.DEBUG) {
    if (module.hot) {
        module.hot.accept('./App', () => {
            const newApp = require('./App').default
            render(newApp)
        });
    }
}

if (Config.DEBUG) {
    window._store = store;
}
