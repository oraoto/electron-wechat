import Types from './Types';
import { AllMessage } from './Types/Message';
import * as MessageType from './Types/MessageType';
import { Contact } from './Types/Contact';
import WechatAdapter from './Adapter';

// Constant Types
const LOGIN = 'WECHAT/LOGIN';
const LOGIN_SUCCESS = 'WECHAT/LOGIN_SUCCESS';
const SWITCH_USER = 'WECHAT/SWITCH_USER'
const LOGOUT = 'WECHAT/LOGOUT';
const LOGOUT_SUCCESS = 'WECHAT/LOGOUT_SUCCESS';
const RECEIVE_MESSAGE = 'WECHAT/RECEIVE_MESSAGE';
const SEND_TEXT_MESSAGE = 'WECHAT/SEND_TEXT_MESSAGE';
const SEND_PICTURE_MESSAGE = 'WECHAT/SEND_PICTURE_MESSAGE';
const SEND_MESSAGE_RESPONSE = 'WECHAT/SEND_MESSAGE_RESPONSE';
const RECEIVE_FRIEND_REQUEST = 'WECHAT/RECEIVE_FRIEND_REQUEST';
const ACCEPT_FRIEND_REQUEST = 'WECHAT/ACCEPT_FRIEND_REQUEST';
const ERROR = 'WECHAT/ERROR';
const CONTACTS_UPDATED = 'WECHAT/CONTACTS_UPDATED';
const START_CHAT = 'WECHAT/START_CHAT';
const FINISHED_CHAT = 'WECHAT/FINISHED_CHAT';
const UPDATE_CONTACT_AVATAR = 'WECHAR/UPDATE_CONTACT_AVATAR'

// Actions Types
export type LoginAction = {
    type: typeof LOGIN
}

export type LoginSuccessAction = {
    type: typeof LOGIN_SUCCESS
    Uin: number
    user: Types.User
}

export type SwitchUserAction = {
    type: typeof SWITCH_USER,
    Uin: number;
}

export type LogoutAction = {
    type: typeof LOGOUT,
    Uin: number
}

export type LogoutSuccessAction = {
    type: typeof LOGOUT_SUCCESS,
    Uin: number
}

export type ReceiveMessageAction = {
    type: typeof RECEIVE_MESSAGE,
    Uin: number,
    message: AllMessage
}

export type SendTextMessageAction = {
    type: typeof SEND_TEXT_MESSAGE,
    Uin: number,
    UserName: string,
    content: string
}

export type SendPictureMessageAction = {
    type: typeof SEND_PICTURE_MESSAGE,
    Uin: number,
    UserName: string,
    filepath: string
}

export type SendMessageResponseAction = {
    type: typeof SEND_MESSAGE_RESPONSE,
    Uin: number,
    success: boolean,
    clientMsgId: string
}

export type ReceiveFriendRequestAction = {
    type: typeof RECEIVE_FRIEND_REQUEST,
    Uin: number,
    message: AllMessage
}

export type AcceptFriendRequestAction = {
    type: typeof ACCEPT_FRIEND_REQUEST,
    Uin: number,
    UserName: string
}

export type ContactsUpdatedAction = {
    type: typeof CONTACTS_UPDATED,
    Uin: number,
    contacts: [Contact]
}

export type ErrorAction = {
    type: typeof ERROR,
    Uin: number,
    err: any
}

export type StartChatAction = {
    type: typeof START_CHAT,
    UserName: string,
    manual: boolean
}

export type FinishChatAction = {
    type: typeof FINISHED_CHAT
    UserName: string
}

export type UpdateContactAvatarAction = {
    type: typeof UPDATE_CONTACT_AVATAR
    UserName: string,
    userAvatar: string
}

export type WechatAction = LoginAction
    | LoginSuccessAction
    | SwitchUserAction
    | LogoutAction
    | LogoutSuccessAction
    | ReceiveMessageAction
    | SendTextMessageAction
    | SendPictureMessageAction
    | SendMessageResponseAction
    | ReceiveFriendRequestAction
    | AcceptFriendRequestAction
    | ContactsUpdatedAction
    | StartChatAction
    | FinishChatAction
    | ErrorAction
    | UpdateContactAvatarAction

// Action Creators
export const login = (): LoginAction => {
    return { type: LOGIN }
}

export const loginSuccess = (Uin: number, user: Types.User): LoginSuccessAction => {
    return { type: LOGIN_SUCCESS, Uin, user }
}

export const switchUser = (Uin: number): SwitchUserAction => {
    return { type: SWITCH_USER, Uin }
}

export const logout = (Uin: number): LogoutAction => {
    return { type: LOGOUT, Uin }
}

export const logoutSuccess = (Uin: number): LogoutSuccessAction => {
    return { type: LOGOUT_SUCCESS, Uin }
}

export const receiveMessage = (Uin: number, message: AllMessage): ReceiveMessageAction => {
    return { type: RECEIVE_MESSAGE, Uin, message }
}

export const sendMessage = (Uin: number, UserName: string, content: string): SendTextMessageAction => {
    return { type: SEND_TEXT_MESSAGE, Uin, UserName, content }
}

export const sendPicture = (Uin: number, UserName: string, filepath: string): SendPictureMessageAction => {
    return { type: SEND_PICTURE_MESSAGE, Uin, UserName, filepath }
}

export const sendMessageResponse = (Uin: number, success: boolean, clientMsgId): SendMessageResponseAction => {
    return { type: SEND_MESSAGE_RESPONSE, Uin, success, clientMsgId }
}

export const receiveFriendRequest = (Uin: number, message: AllMessage): ReceiveFriendRequestAction => {
    return { type: RECEIVE_FRIEND_REQUEST, Uin, message }
}

export const acceptFriendRequest = (Uin: number, UserName: string): AcceptFriendRequestAction => {
    return { type: ACCEPT_FRIEND_REQUEST, Uin, UserName }
}

export const contactsUpdated = (Uin: number, contacts: [Contact]): ContactsUpdatedAction => {
    return { type: CONTACTS_UPDATED, Uin, contacts }
}

export const error = (Uin: number, err: any): ErrorAction => {
    return { type: ERROR, Uin, err }
}

export const start_chat = (UserName: string, manual: boolean): StartChatAction => {
    return { type: START_CHAT, UserName, manual }
}

export const finish_chat = (UserName: string): FinishChatAction => {
    return { type: FINISHED_CHAT, UserName }
}

export const updateContactAvatar = (UserName: string, userAvatar: string): UpdateContactAvatarAction => {
    return { type: UPDATE_CONTACT_AVATAR, UserName, userAvatar}
}


type Uin = number
type UserName = string


// State Types
export type WechatState = {
    users: Types.User[]
    contacts: Types.Contacts
    messages: AllMessage[]
    selected_user: Uin | null
    selected_contacts: Types.SelectedContacts
}

// State
const defaultState: WechatState = {
    users: [] as Types.User[],
    contacts: {} as Types.Contacts,
    selected_contacts: {} as Types.SelectedContacts,
    messages: [] as AllMessage[],
    selected_user: null,
}

// Reducer, in-place update, not pure!!!
const reducer = (state = defaultState, action: WechatAction): WechatState => {
    var adapter = (window as any).wechatAdapter as WechatAdapter;

    switch (action.type) {
        case LOGIN:
            adapter.newWechat();
            return state;
        case LOGIN_SUCCESS: {
            let users = state.users.filter(x => x.Uin != action.user.Uin)
            users.push(action.user);
            let selected_contacts = { ...state.selected_contacts, [action.user.Uin]: null }
            return {
                ...state,
                users: users,
                selected_user: action.user.Uin,
                selected_contacts
            };
        }
        case SWITCH_USER: {
            if (action.Uin == state.selected_user) {
                return state;
            }
            let users = state.users.concat();
            let user = users.find((u) => u.Uin == action.Uin);
            user.hasUnread = false;

            return {
                ...state,
                selected_user: action.Uin,
                users
            }
        }
        case LOGOUT:
            adapter.find(action.Uin).logout();
            return state;
        case LOGOUT_SUCCESS: {
            let users = state.users.filter(x => x.Uin != action.Uin)
            let contacts = {};
            for (let user_name in state.contacts) {
                if (state.contacts[user_name].fromUserUin != action.Uin) {
                    contacts[user_name] = state.contacts[user_name]
                }
            }
            let selected_user = state.selected_user;
            if (selected_user == action.Uin) {
                selected_user = null;
            }
            let selected_contacts = state.selected_contacts;
            delete selected_contacts[action.Uin];
            // TODO: clean up messages
            return {
                ...state,
                users,
                contacts,
                selected_user,
                selected_contacts
            }
        }
        case SEND_TEXT_MESSAGE:
            adapter.find(action.Uin).sendText(action.content, action.UserName);
            return state;
        case SEND_PICTURE_MESSAGE:
            adapter.find(action.Uin).sendPicture(action.filepath, action.UserName);
            return state;
        case CONTACTS_UPDATED: {
            // inplace update
            let contacts = state.contacts;
            let new_contacts = [];

            action.contacts.forEach(c => {
                delete c.chatting
                var exist = contacts[c.UserName];
                if (exist) {
                    Object.assign(exist, c);
                } else {
                    contacts[c.UserName] = c;
                }
            })
            return { ...state, contacts: contacts };
        }
        case RECEIVE_MESSAGE: {
            if (action.message.MsgType == MessageType.StatusNotify) {
                if (action.message.StatusNotifyCode == 4) {
                    return recentContacts(state, action.message.StatusNotifyUserName.split(','));
                } else {
                    return state;
                }
            }

            let messages = state.messages.concat(action.message);
            let contacts = { ...state.contacts }
            let new_state = { ...state, messages }

            let contact = contacts[action.message.FromUserName];

            if (contact) {
                contact = { ...contact, chatting: true }
            }

            if (action.message.isSendBySelf) {
                let to_contact = contacts[action.message.ToUserName];
                if (!to_contact) {
                    return new_state;
                }
                to_contact = { ...to_contact, chatting: true };
                contacts[to_contact.UserName] = to_contact;
                return { ...new_state, contacts }
            }

            if (contact) {
                if (contact.UserName != new_state.selected_contacts[action.Uin]) {
                    contact = { ...contact, hasUnread: true }
                    contacts[contact.UserName] = contact;
                    new_state = { ...new_state, contacts };
                }
                let users = state.users.concat();
                // TODO
                let recv_user = users.find((u) => u.Uin == contact.fromUserUin);
                if (recv_user && recv_user.Uin != state.selected_user) {
                    recv_user.hasUnread = true;
                    new_state = { ...new_state, users };
                }
            }
            return new_state;
        }
        case ERROR:
            console.log(action.err);
            return state;
        case START_CHAT: {
            let contacts = { ...state.contacts }
            let exist_contact = contacts[action.UserName]
            if (!exist_contact) {
                return state;
            }

            exist_contact = { ...exist_contact, chatting: true, hasUnread: false }
            contacts[exist_contact.UserName] = exist_contact;

            let selected_contacts = { ...state.selected_contacts }
            if (action.manual) {
                selected_contacts[exist_contact.fromUserUin] = action.UserName;
            }

            return { ...state, contacts, selected_contacts };
        }
        case FINISHED_CHAT: {
            let contacts = { ...state.contacts }
            let chatting_contact = contacts[action.UserName]
            chatting_contact.chatting = false;
            contacts[chatting_contact.UserName] = chatting_contact;

            let selected_contacts = { ...state.selected_contacts };
            if (chatting_contact.UserName == state.selected_contacts[chatting_contact.fromUserUin]) {
                delete selected_contacts[chatting_contact.fromUserUin]
            }
            return { ...state, selected_contacts, contacts }
        }
        case UPDATE_CONTACT_AVATAR: {
            let contacts = { ...state.contacts }
            let exist_contact = contacts[action.UserName]
            if (!exist_contact) {
                return state;
            }

            exist_contact = { ...exist_contact, userAvatar: action.userAvatar }
            contacts[exist_contact.UserName] = exist_contact;

            return { ...state, contacts };
        }
        default:
            return state;
    }
}
export default reducer;


const recentContacts = (state: WechatState, usernames: string[]): WechatState => {
    let contacts = { ...state.contacts }
    usernames.forEach((name) => {
        let c = contacts[name];
        if (c) {
            contacts[name] = { ...c, chatting: true }
        }
    });
    return { ...state, contacts };
}