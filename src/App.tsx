import * as React from 'react';
import { Router, Link, Route, IndexRoute } from 'react-router'
import { connect } from 'react-redux';

import Counter from './Components/Counter'
import Wechat from './Containers/Wechat'
import Layout from './Layout';

class App extends React.Component<any, any> {

    render() {
        return (
            <div>
                <Router history={this.props.history}>
                    <Route path={(window as any).router_root} component={Layout}>
                        <IndexRoute component={Wechat} />
                        <Route path="/wechat" component={Wechat} />
                        <Route path="/counter" component={Counter} />
                    </Route>
                </Router>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = (dispatch) => ({

});
export default connect(mapStateToProps, mapDispatchToProps)(App);

