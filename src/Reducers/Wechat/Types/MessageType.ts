
export const Text : 1 = 1

export const Image = 3

export const Voice = 34

export const Video = 43

export const Microvideo = 62

// TODO：content不为空的表情可以通过webwxgetmsgimg获取
export const Emoticon = 47

export const App = 49

export const VoipMsg = 50

export const VoipNotify = 52

export const VoipInvtee = 53

export const Location = 48

export const StatusNotify = 51

export const Sysnotice = 9999

export const PossibleFriendMsg = 40

export const VerifyMsg = 37

export const ShareCard = 42

export const Sys = 1e4

export const Recalled = 10002;

export type MessageType =
      typeof Text
    | typeof Image
    | typeof Voice
    | typeof Video
    // | Microvideo
    // | Emoticon
    | typeof App
    // | VoipMsg
    // | VoipNotify
    // | VoipInvtee
    // | Location
    | typeof StatusNotify
    // | Sysnotice
    // | PossibleFriendMsg
    // | VerifyMsg
    | typeof ShareCard
    | typeof Sys
    // | Recalled
