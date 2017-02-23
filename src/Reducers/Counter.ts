// Constant Types
type INCREMENT = 'COUNTER/INCREMENT';
const INCREMENT : INCREMENT = 'COUNTER/INCREMENT';

type DECREMENT = 'COUNTER/DECREMENT';
const DECREMENT : DECREMENT = 'COUNTER/DECREMENT';

// Actions Types
interface CounterIncrementAction {
    type: INCREMENT
    by: number
}

interface CounterDecrementAction {
    type: DECREMENT,
    by: number
}

export type CounterAction = CounterIncrementAction | CounterDecrementAction

// Action Creators
export const increment = (by: number): CounterIncrementAction => {
    return {type: INCREMENT, by: by}
}

export const decrement = (by: number): CounterDecrementAction => {
    return {type: DECREMENT, by: by}
}

// State Types
export interface CounterState {
    count: number
}

// State
const defaultState: CounterState = {
    count: 0
}

// Reducer
const reducer = (state = defaultState, action: CounterAction) => {
    switch (action.type) {
        case INCREMENT:
            return {...state, count: state.count + action.by}
        case DECREMENT:
            return {...state, count: state.count - action.by}
        default:
            return state;
    }
};

export default reducer;
