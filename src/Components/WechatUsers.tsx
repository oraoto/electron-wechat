import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { State } from '../Reducers';
import * as Types from '../Reducers/Wechat/Types'
import { Menu, Icon, Badge, Button } from 'antd';

interface OwnProps {
    users: Types.User[]
    selected_user: Types.User
    switch_user: any;
    login: any;
    heihgt: number;
    // add_user: any;
    // delete_user: any;
}

interface OwnState { }


type WechatUsersProps = OwnProps

class WechatUsers extends React.Component<WechatUsersProps, OwnState> {

    handleClick(e) {
        this.props.switch_user(parseInt(e.key))
    }

    handleAddWechat(e) {
        this.props.login();
    }

    render() {

        let selectedKeys = this.props.selected_user ? ['' + this.props.selected_user.Uin] : []

        return (
            <div className={'wechat_users'} style={{ height: this.props.heihgt }}>
                <Menu style={{ width: 60 }} mode="inline" selectedKeys={selectedKeys} onSelect={this.handleClick.bind(this)}>
                    {
                        this.props.users.map((u) => {
                            if (u.hasUnread) {
                                return (
                                    <Menu.Item key={'' + u.Uin}><Badge dot count={0}><img src={u.userAvatar} /></Badge></Menu.Item>
                                );
                            } else {
                                return (
                                    <Menu.Item key={'' + u.Uin}><img src={u.userAvatar} /></Menu.Item>
                                );
                            }
                        })
                    }
                </Menu>

                { this.props.users.length < 8 ?
                    <div style={{textAlign: 'center', padding: 12}}>
                        <Button type="primary" shape="circle" icon="plus" onClick={this.handleAddWechat.bind(this)}/>
                    </div>
                    : null
                }
            </div>
        );
    }
}


export default WechatUsers;