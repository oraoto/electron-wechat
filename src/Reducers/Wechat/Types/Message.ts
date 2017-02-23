import * as MessageType from './MessageType';

export interface BaseMessage {
    // 大写字母开头的字段来源于微信接口
    FromUserName: string
    ToUserName: string
    Content: string
    CreateTime: string
    MsgId: string
    Status: number

    // 发送消息时使用
    Type?: number;
    LocalID?: string;
    ClientMsgId?: string;

    isSendBySelf: boolean;

    // 消息的原始内容
    originalContent?: string;
}

export interface TextMessage extends BaseMessage {
    MsgType: typeof MessageType.Text;
}

export interface ImageMessage extends BaseMessage {
    MsgType: typeof MessageType.Image;
    ImgWidth: number;
    ImgHeight: number;
    ImgStatus: number;

    filePath: string;
}

export interface VideoMessage extends BaseMessage {
    MsgType: typeof MessageType.Video;
    ImgWidth: number;
    ImgHeight: number;
    ImgStatus: number;
    filePath: string;
}

export interface VoiceMessage extends BaseMessage {
    MsgType: typeof MessageType.Voice;
    filePath: string;
}

export interface AppMessage extends BaseMessage {
    MsgType: typeof MessageType.App;
    FileName: string;
    Url: string;
}

export interface SysMessage extends BaseMessage {
    MsgType: typeof MessageType.Sys;
}

type RecommendInfo = {
    UserName: string;
    NickName: string;
    QQNum: number;
    Province: string;
    City: string;
    Content: string;
    Signature: string;
    Alias: string;
    Scene: number;
    VerifyFlag: number;
    AttrStatus: number;
    Sex: number;
    Ticket: string;
    OpCode: number;
}

export interface ShareCardMessage extends BaseMessage {
    MsgType: typeof MessageType.ShareCard;
    Ticket: string;
    RecommendInfo: RecommendInfo;
}

export interface StatusNotifyMessage extends BaseMessage {
    MsgType: typeof MessageType.StatusNotify;
    StatusNotifyCode: number;
    StatusNotifyUserName: string;
}

export type AllMessage = TextMessage | ImageMessage | VideoMessage | VoiceMessage
    | AppMessage | SysMessage | ShareCardMessage | StatusNotifyMessage
