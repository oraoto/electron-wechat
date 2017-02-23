import * as Redux from 'redux';
import * as windowReducer from './index'

export default class WindowAdapter {
    store: Redux.Store<{}>

    constructor(store: Redux.Store<{}>) {
        this.store = store;
        window.addEventListener('resize', function(e) {
            store.dispatch(windowReducer.resize(window.innerHeight, window.innerWidth));
        });
    }
}