const UPDATE = 'CHAT_INPUT/UPDATE';
const APPEND = 'CHAT_INPUT/APPEND';

export type UpdateChatInputAction = {
    type: typeof UPDATE,
    content: string,
}

export type AppendChatInputAction = {
    type: typeof APPEND,
    content: string,
}

type ChatInputActions = UpdateChatInputAction | AppendChatInputAction


export type ChatInputState = string

// State
const defaultState: ChatInputState = ''

export const update = (content: string): UpdateChatInputAction => {
    return {type: UPDATE, content}
}

export const append = (content: string): AppendChatInputAction => {
    return {type: APPEND, content}
}

// Reducer
const reducer = (state = defaultState, action: ChatInputActions) => {
    var selected_category = null;

    switch (action.type) {
        case UPDATE:
            return action.content
        case APPEND:
            return state + action.content;
        default:
            return state;
    }
};

export default reducer;
