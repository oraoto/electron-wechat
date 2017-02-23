import * as React from 'react';
import { Link } from 'react-router'
import { connect } from 'react-redux';
import Counter from './Components/Counter'
//import Wechat from './Components/Wechat'

import { Menu, Icon, Switch } from 'antd';
import { Row, Col } from 'antd';

const SubMenu = Menu.SubMenu;

class Layout extends React.Component<any, any> {

    render() {
        return (
            <div className={'app'}>
                <div className={'pageContent'}>
                     {this.props.children}
                </div>
            </div>
        );
    }
}
export default connect()(Layout);



