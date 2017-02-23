
export function getApiPaths(host = 'wx.qq.com'): ApiPaths {
    let origin = `https://${host}`;
    let loginUrl = "login.weixin.qq.com";
    let fileUrl = "file.wx.qq.com";
    let pushUrl = "webpush.weixin.qq.com";
    host.indexOf("wx2.qq.com") > -1 ? (loginUrl = "login.wx2.qq.com", fileUrl = "file.wx2.qq.com", pushUrl = "webpush.wx2.qq.com")
        : host.indexOf("wx8.qq.com") > -1 ? (loginUrl = "login.wx8.qq.com", fileUrl = "file.wx8.qq.com", pushUrl = "webpush.wx8.qq.com")
        : host.indexOf("qq.com") > -1 ? (loginUrl = "login.wx.qq.com", fileUrl = "file.wx.qq.com", pushUrl = "webpush.wx.qq.com")
        : host.indexOf("web2.wechat.com") > -1 ? (loginUrl = "login.web2.wechat.com", fileUrl = "file.web2.wechat.com", pushUrl = "webpush.web2.wechat.com")
        : host.indexOf("wechat.com") > -1 && (loginUrl = "login.web.wechat.com", fileUrl = "file.web.wechat.com", pushUrl = "webpush.web.wechat.com");

    let conf = {
        origin: origin,
        baseUri: origin + "/cgi-bin/mmwebwx-bin",
        API_jsLogin: "https://" + loginUrl + "/jslogin?appid=wx782c26e4c19acffb&fun=new&lang=zh-CN",
        API_login: "https://" + loginUrl + "/cgi-bin/mmwebwx-bin/login",
        API_synccheck: "https://" + pushUrl + "/cgi-bin/mmwebwx-bin/synccheck",
        API_webwxdownloadmedia: "https://" + fileUrl + "/cgi-bin/mmwebwx-bin/webwxgetmedia",
        API_webwxuploadmedia: "https://" + fileUrl + "/cgi-bin/mmwebwx-bin/webwxuploadmedia",
        API_webwxpreview: origin + "/cgi-bin/mmwebwx-bin/webwxpreview",
        API_webwxinit: origin + "/cgi-bin/mmwebwx-bin/webwxinit",
        API_webwxgetcontact: origin + "/cgi-bin/mmwebwx-bin/webwxgetcontact",
        API_webwxsync: origin + "/cgi-bin/mmwebwx-bin/webwxsync",
        API_webwxbatchgetcontact: origin + "/cgi-bin/mmwebwx-bin/webwxbatchgetcontact",
        API_webwxgeticon: origin + "/cgi-bin/mmwebwx-bin/webwxgeticon",
        API_webwxsendmsg: origin + "/cgi-bin/mmwebwx-bin/webwxsendmsg",
        API_webwxsendmsgimg: origin + "/cgi-bin/mmwebwx-bin/webwxsendmsgimg",
        API_webwxsendmsgvedio: origin + "/cgi-bin/mmwebwx-bin/webwxsendvideomsg",
        API_webwxsendemoticon: origin + "/cgi-bin/mmwebwx-bin/webwxsendemoticon",
        API_webwxsendappmsg: origin + "/cgi-bin/mmwebwx-bin/webwxsendappmsg",
        API_webwxgetheadimg: origin + "/cgi-bin/mmwebwx-bin/webwxgetheadimg",
        API_webwxgetmsgimg: origin + "/cgi-bin/mmwebwx-bin/webwxgetmsgimg",
        API_webwxgetmedia: origin + "/cgi-bin/mmwebwx-bin/webwxgetmedia",
        API_webwxgetvideo: origin + "/cgi-bin/mmwebwx-bin/webwxgetvideo",
        API_webwxlogout: origin + "/cgi-bin/mmwebwx-bin/webwxlogout",
        API_webwxgetvoice: origin + "/cgi-bin/mmwebwx-bin/webwxgetvoice",
        API_webwxupdatechatroom: origin + "/cgi-bin/mmwebwx-bin/webwxupdatechatroom",
        API_webwxcreatechatroom: origin + "/cgi-bin/mmwebwx-bin/webwxcreatechatroom",
        API_webwxstatusnotify: origin + "/cgi-bin/mmwebwx-bin/webwxstatusnotify",
        API_webwxcheckurl: origin + "/cgi-bin/mmwebwx-bin/webwxcheckurl",
        API_webwxverifyuser: origin + "/cgi-bin/mmwebwx-bin/webwxverifyuser",
        API_webwxfeedback: origin + "/cgi-bin/mmwebwx-bin/webwxsendfeedback",
        API_webwxreport: origin + "/cgi-bin/mmwebwx-bin/webwxstatreport",
        API_webwxsearch: origin + "/cgi-bin/mmwebwx-bin/webwxsearchcontact",
        API_webwxoplog: origin + "/cgi-bin/mmwebwx-bin/webwxoplog",
        API_checkupload: origin + "/cgi-bin/mmwebwx-bin/webwxcheckupload",
    }
    return conf;
}

export type ApiPaths = {
    origin: string,
    baseUri: string,
    API_jsLogin: string,
    API_login: string,
    API_synccheck: string,
    API_webwxdownloadmedia: string,
    API_webwxuploadmedia: string,
    API_webwxpreview: string,
    API_webwxinit: string,
    API_webwxgetcontact: string,
    API_webwxsync: string,
    API_webwxbatchgetcontact: string,
    API_webwxgeticon: string,
    API_webwxsendmsg: string,
    API_webwxsendmsgimg: string,
    API_webwxsendmsgvedio: string,
    API_webwxsendemoticon: string,
    API_webwxsendappmsg: string,
    API_webwxgetheadimg: string,
    API_webwxgetmsgimg: string,
    API_webwxgetmedia: string,
    API_webwxgetvideo: string,
    API_webwxlogout: string,
    API_webwxgetvoice: string,
    API_webwxupdatechatroom: string,
    API_webwxcreatechatroom: string,
    API_webwxstatusnotify: string,
    API_webwxcheckurl: string,
    API_webwxverifyuser: string,
    API_webwxfeedback: string,
    API_webwxreport: string,
    API_webwxsearch: string,
    API_webwxoplog: string,
    API_checkupload: string,
}