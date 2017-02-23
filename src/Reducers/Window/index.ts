// Constant Types
const RESIZE = "WINDOW/RESIZE";

// Actions Types
export type ResizeAction = {
    type: typeof RESIZE
    height: number
    width: number
}

export type WindowAction = ResizeAction

// Action Creators
export const resize = (height, width) : ResizeAction => {
    return {type: RESIZE, height, width}
}

export type WindowState = {
    height: number
    width: number

}

// State
const defaultState : WindowState = {
    height: window.innerHeight,
    width: window.innerWidth
}

// Reducer, not pure!!!
const reducer = (state = defaultState, action: WindowAction): WindowState => {

    switch (action.type) {
        case RESIZE:
            return {...state, height: action.height, width: action.height};
        default:
            return state;
    }
}
export default reducer;



