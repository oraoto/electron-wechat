export class Contact {
    Uin: string;
    UserName: string;
    NickName: string;
    HeadImgUrl?: string;
    ContactFlag?: number;
    MemberCount?: string;
    MemberList?: [Contact];
    RemarkName?: string;
    HideInputBarFlag?: number;
    Sex: number;
    Signature?: string;
    VerifyFlag?: number;
    OwnerUin?: string;
    PYInitial?: string;
    PYQuanPin?: string;
    RemarkPYInitial?: string;
    RemarkPYQuanPin?: string;
    StarFriend?: number;
    AppAccountFlag?: number;
    Statues?: string;
    AttrStatus?: string;
    Province?: string;
    City: string;
    Alias: string;
    SnsFlag?: number;
    UniFriend?: number;
    DisplayName?: string;
    ChatRoomId?: string;
    KeyWord?: string;
    EncryChatRoomId?: string;
    isSelf?: boolean;
    AvatarUrl?: string;

    fromUserUin: number;
    chatting?: boolean;
    displayName: string;
    userAvatar?: string;
    hasUnread?: boolean;
    sort_name?: string;
}

export type Contacts = {
    [key: string]: Contact
}

export type SelectedContacts = {
    [key: number]: string | null
}