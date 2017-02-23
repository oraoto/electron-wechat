import * as Types from '../Types';

import Axios from 'axios';
import Constant from './Constant';
interface SyncKey {
    List: Array<any>
}

/**
 * 同步信息
 *
 * @export
 * @interface SyncProp
 */
export interface SyncProp {
    uuid: string,
    uin: string,
    sid: string,
    skey: string,
    passTicket: string,
    formatedSyncKey: string,
    webwxDataTicket: string,
    syncKey: SyncKey,
}

// TODO
export type RequestSender = any;

export type Event =
    'error' // 错误
    | 'uuid'  // UUID
    | 'user-avatar' //
    | 'login'  // 登录成功
    | 'message' // 接收消息
    | 'send-message-result' // 发送消息结果
    | 'contacts-updated'  //
    | 'logout'  // 退出
    | 'contact-avatar' // 获取联系人头像


/**
 * 好友
 *
 * @export
 * @interface Friend
 */
export interface Friend {
    UserName: string;
    NickName: string;
    PY: string;
    Avatar: string;
}

/**
 * API请求的基础数据
 *
 * @export
 * @interface BaseRequest
 */
export interface BaseRequest {
    Uin: number;
    Sid: string;
    Skey: string;
    DeviceID: string;
}

export type Contacts = {
    [indexer: string]: Types.Contact
}