import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { State } from '../Reducers';
import * as WindowReducer from '../Reducers/Window'
import * as Reducers from '../Reducers/Wechat'
import * as Types from '../Reducers/Wechat/Types'
import { objectToArray } from '../shared';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

import WechatUsers from '../Components/WechatUsers'
import WechatContacts from '../Components/WechatContacts';
import Chat from '../Components/Chat';

interface OwnProps { }
interface OwnState { }


interface ConnectedState {
    users: Types.User[]
    contacts: Types.Contacts
    messages: Types.AllMessage[]
    selected_user: number | null
    selected_contacts: Types.SelectedContacts
    window: WindowReducer.WindowState,
}

interface ConnectedDispatch {
    switch_user: (uin: number) => void
    start_chat: (user_name: string) => void
    finish_chat: (user_name: string) => void
    login: () => void
    send_text: (uin, username, content) => void
    send_image: (uin, username, filepath) => void,
}

type WechatProps = ConnectedState & ConnectedDispatch & OwnProps

class Wechat extends React.Component<WechatProps, OwnState> {

    render() {
        let selected_user = null as Types.User;
        let contacts = [];
        let chatting_contacts = [];
        let selected_contact = null as Types.Contact;
        let chatting = false;

        if (this.props.selected_user) {
            selected_user = this.props.users.find((u) => u.Uin == this.props.selected_user);
            for (let user_name in this.props.contacts) {
                let c = this.props.contacts[user_name];
                if (c.fromUserUin == this.props.selected_user && !c.isSelf) {
                    contacts.push(c);
                    if (c.chatting) {
                        chatting_contacts.push(c)
                    }
                }
            }
        }
        let messages = [] as Types.AllMessage[];
        if (selected_user) {
            selected_contact = this.props.contacts[this.props.selected_contacts[selected_user.Uin]];
        }

        if (selected_user && selected_contact) {
            chatting = true;
            messages = this.props.messages.filter((m) =>
                (m.FromUserName == selected_user.UserName && m.ToUserName == selected_contact.UserName)
                || (m.ToUserName == selected_user.UserName && m.FromUserName == selected_contact.UserName)
            );

        }

        return (
            <div className={'wechat'}>
                <WechatUsers
                    switch_user={this.props.switch_user}
                    login={this.props.login}
                    users={this.props.users}
                    selected_user={selected_user}
                    heihgt={this.props.window.height} />
                {this.props.selected_user ?
                    <WechatContacts contacts={contacts}
                        selected_contcat={selected_contact}
                        start_chat={this.props.start_chat}
                        chatting_contacts={chatting_contacts}
                        finish_chat={this.props.finish_chat}
                        height={this.props.window.height}
                        />
                    : null}
                {chatting ?
                    <Chat messages={messages}
                        contact={selected_contact}
                        user={selected_user}
                        height={this.props.window.height}
                        send_text={this.props.send_text}
                        send_image={this.props.send_image} />
                    : null}
            </div>
        )
    }
}

const mapStateToProps = (state: State, ownProps: OwnProps): ConnectedState => ({
    users: state.wechat.users,
    contacts: state.wechat.contacts,
    messages: state.wechat.messages,
    selected_user: state.wechat.selected_user,
    selected_contacts: state.wechat.selected_contacts,
    window: state.window,
})

const mapDispatchToProps = (dispatch: Redux.Dispatch<State>): ConnectedDispatch => ({
    switch_user: (uin) => dispatch(Reducers.switchUser(uin)),
    start_chat: (user_name) => dispatch(Reducers.start_chat(user_name, true)),
    finish_chat: (user_name) => dispatch(Reducers.finish_chat(user_name)),
    login: () => dispatch(Reducers.login()),
    send_text: (uin, username, content) => dispatch(Reducers.sendMessage(uin, username, content)),
    send_image: (uin, username, filepath) => dispatch(Reducers.sendPicture(uin, username, filepath)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Wechat);