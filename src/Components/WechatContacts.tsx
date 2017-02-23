import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { State } from '../Reducers';
import * as Types from '../Reducers/Wechat/Types';
import { SelectParam } from 'antd/lib/menu';

import { Tabs, Button, Icon, Menu, Table, Badge, Input } from 'antd';
const TabPane = Tabs.TabPane;
const MenuItemGroup  = Menu.ItemGroup;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;

interface OwnProps {
    contacts: Types.Contact[],
    chatting_contacts: Types.Contact[],
    selected_contcat: Types.Contact | null,
    start_chat: (user_name: string) => void
    finish_chat: (user_name: string) => void,
    height: number
}
interface OwnState {
    search: string | null
}

type WechatContactsProps = OwnProps

class WechatContacts extends React.Component<WechatContactsProps, OwnState> {

    constructor() {
        super();
        this.state = { search: null }
    }

    handleRowClick(contact: Types.Contact, index: number) {
        this.props.start_chat(contact.UserName);
    }

    handleStatChat(e: SelectParam) {
        this.props.start_chat(e.key);
        let contact = this.props.contacts.find((c) => c.UserName == e.key);
    }


    handleFinishChat(e: React.MouseEvent<any>, user_name: string) {
        e.stopPropagation();
        this.props.finish_chat(user_name)
    }

    handleSearchChange(e: React.FormEvent<HTMLInputElement>) {
        let v = e.currentTarget.value ? e.currentTarget.value : null;
        this.setState({
            search: v
        });
    }

    render() {

        const columns = [{
            title: 'Name',
            key: 'UserName',
            render: (text, record, index) => {
                if (!this.props.selected_contcat || this.props.selected_contcat.UserName != record.UserName) {
                    return <div>{record.RemarkName || record.NickName}</div>;
                } else {
                    return <div style={{ backgroundColor: '#b8d3f9' }}>{record.RemarkName || record.NickName}</div>
                }
            }
        }];

        let selected_keys = this.props.selected_contcat ? [this.props.selected_contcat.UserName] : [];


        let contacts = this.props.contacts;

        if (this.state.search) {
            let lower = this.state.search.toLowerCase();
            contacts = contacts.filter((c) =>
                c.NickName.toLowerCase().includes(lower) ||
                c.RemarkPYQuanPin.toLowerCase().includes(lower) ||
                c.RemarkPYInitial.toLowerCase().includes(lower) ||
                c.RemarkName.toLowerCase().includes(lower) ||
                c.PYQuanPin.toLowerCase().includes(lower) ||
                c.PYInitial.toLowerCase().includes(lower) ||
                c.Alias.toLowerCase().includes(lower)
            )
        }

        // TODO: move this to ContactFactroy
        contacts = contacts.map((c) => {
            let s= c.RemarkPYQuanPin || c.RemarkPYInitial || c.PYQuanPin || c.PYInitial || c.NickName;
            s = s.toLowerCase().replace(/spanclass.*span/, ' ')
            return {...c, sort_name: s}
        });
        contacts = contacts.sort((a, b) => {
            return a.sort_name > b.sort_name ? 1 : (a.sort_name == b.sort_name ? 0 : -1)
        });
        let contact_py_groups = {} as {[key: string]: Types.Contact[]};

        let special = [] as Types.Contact[];
        contacts.forEach((c) => {
            let code = c.sort_name.charCodeAt(0);
            let initial = c.sort_name.charAt(0);
            if (code < 97|| code > 122) {
                special.push(c);
                return;
            }
            if (contact_py_groups[initial]) {
                contact_py_groups[initial].push(c);
            } else {
                contact_py_groups[initial] = [c];
            }
        });
        contact_py_groups['😆'] = special;

        let contact_menu_groups = [];
        for (let k in contact_py_groups) { // Bad
            contact_menu_groups.push(
                <MenuItemGroup title={k.toUpperCase()} key={k}>
                            {
                                contact_py_groups[k].map((u) => (
                                    <Menu.Item key={u.UserName}>
                                        <img src={u.userAvatar} />
                                        {u.RemarkName || u.NickName}
                                    </Menu.Item>
                                ))
                            }
                </MenuItemGroup>
            )
        }

        let contacts_menu_style = {
            maxHeight: this.props.height - 37 - 30,
            overflowY: 'scroll'
        }

        let contacts_menu =
            <Menu mode="inline" className="contact_list"
                selectedKeys={selected_keys} onClick={this.handleStatChat.bind(this)} style={contacts_menu_style}>
                {contact_menu_groups}
            </Menu>

        let chatting_menu_style = {
            maxHeight: this.props.height - 37,
            overflowY: 'scroll'
        }

        let chatting_menu =
            <Menu mode="inline" className="chatting_list"
                  selectedKeys={selected_keys} onClick={this.handleStatChat.bind(this)} style={chatting_menu_style}>
                {
                    this.props.chatting_contacts.map((u) => {
                        if (!u.hasUnread) {
                            return (
                                <Menu.Item key={u.UserName}>
                                    <img src={u.userAvatar} />
                                    {u.RemarkName || u.NickName}
                                    <Icon type="close" onClick={(e) => this.handleFinishChat(e, u.UserName)} />
                                </Menu.Item>
                            )
                        } else {
                            return (
                                <Menu.Item key={u.UserName}>
                                    <Badge status="error" count={0}><img src={u.userAvatar} /></Badge>

                                    {u.RemarkName || u.NickName}
                                    <Icon type="close" onClick={(e) => this.handleFinishChat(e, u.UserName)} />
                                </Menu.Item>
                            )
                        }
                    })
                }
            </Menu>

        return (
            <div className={'wechat_contacts'}>
                <Tabs animated={false} >
                    <TabPane tab={<Icon type="message" title="聊天" />} key="1">{chatting_menu}</TabPane>
                    <TabPane tab={<Icon type="team" title="通迅录" />} key="2">
                        <Input onChange={this.handleSearchChange.bind(this)} placeholder="搜索" />
                        {contacts_menu}
                    </TabPane>
                </Tabs>
            </div >
        )
    }
}


export default WechatContacts;
