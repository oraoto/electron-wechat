import * as React from 'react';
import * as Redux from 'redux'
import { connect } from 'react-redux';
import {State} from '../Reducers'
import {increment, decrement} from '../Reducers/Counter';
import {Button, Icon} from 'antd';
import {ipcRenderer} from 'electron';

interface OwnProps {}
interface OwnState {}
interface ConnectedState {
    count: number
}
interface ConnectedDispatch {
  increment: () => void,
  decrement: () => void
}
type CounterProps = ConnectedState & ConnectedDispatch & OwnProps;

class Counter extends React.Component<CounterProps, OwnState> {

    render () {
        return (
            <div>
                <h1>Count: {this.props.count}</h1>
                <Button type="primary" onClick={this.props.increment}><Icon type="plus"/></Button>
                <Button type="primary" onClick={this.props.decrement}><Icon type="plus"/></Button>
            </div>
        )
    }
}

const mapStateToProps = (state: State, ownProps: OwnProps): ConnectedState => ({
    count: state.counter.count
});

const mapDispatchToProps = (dispatch: Redux.Dispatch<State>): ConnectedDispatch => ({
    increment: () => {
        ipcRenderer.send('message', 'inc');
        dispatch(increment(1))
    },
    decrement: () => {
        ipcRenderer.send('message', 'dec');
        dispatch(decrement(2))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
