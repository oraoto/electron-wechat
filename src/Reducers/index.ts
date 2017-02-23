import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'

import counterReducer, * as Counter from './Counter'
import wechatReducer, * as Wechat from './Wechat'
import windowReducer, * as Window from './Window'
import chatInputReducer, * as ChatInput from './ChatInput'

export interface State {
    counter: Counter.CounterState,
    wechat: Wechat.WechatState,
    window: Window.WindowState
    chat_input: ChatInput.ChatInputState,
}

const reducer = combineReducers({
    counter: counterReducer,
    wechat: wechatReducer,
    routing: routerReducer,
    window: windowReducer,
    chat_input: chatInputReducer,
});

export default reducer;
