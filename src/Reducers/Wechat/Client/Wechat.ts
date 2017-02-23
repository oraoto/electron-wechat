import * as fs from 'fs'
import * as path from 'path'
import * as bl from 'bl'
import * as FormData from 'form-data'
import * as mime from 'mime'
import * as _ from 'lodash'
import { EventEmitter } from 'events'
import { getApiPaths, ApiPaths } from './ApiPaths';
import Constant from './Constant';
import Request from './Request';

import * as Util from './Util'

import ContactFactory from './ContactFactory'
import MessageFactory from './MessageFactory'
import * as InternalTypes from './Types'
import * as Types from '../Types'

const debug = (...args) => console.log(args);

process.on('uncaughtException', err => {
    console.log('uncaughtException', err)
})

class Wechat extends EventEmitter implements Wechat {

    wid: string;
    Contact: ContactFactory;
    Message: MessageFactory;
    ApiPaths: ApiPaths;
    PROP: InternalTypes.SyncProp;
    lastReportTime: number;
    syncErrorCount: number;
    static STATE;
    user: Types.User;
    state: string;
    contacts: InternalTypes.Contacts;
    request: InternalTypes.RequestSender;
    rediUri: string;

    constructor() {
        super();
        this.PROP = {
            uuid: '',
            uin: '',
            sid: '',
            skey: '',
            passTicket: '',
            formatedSyncKey: '',
            webwxDataTicket: '',
            syncKey: {
                List: []
            }
        }
        this.ApiPaths = getApiPaths();
        let req = new Request();
        this.request = req.request.bind(req);
        this.state = Constant.STATE.init
        this.contacts = {}
        this.user = {} as Types.User
        this.Contact = new ContactFactory(this)
        this.Message = new MessageFactory(this)
        this.lastReportTime = 0
        this.syncErrorCount = 0
    }

    /**
     * 好友列表
     * todo: move to state
     * @readonly
     *
     * @memberOf Wechat
     */
    get friendList() {
        let members = [];

        for (let key in this.contacts) {
            let member = this.contacts[key];
            if (this.Contact.isFriend(member)) {
                members.push(member);
            }
        }
        return members;
    }

    /**
     * 启动实例，登录和保持同步。
     * 调用该方法后，通过监听事件来处理消息
     *
     * @memberOf Wechat
     */
    async start() {
        let ret = undefined as any
        try {
            ret = await this.getUUID()
            debug('getUUID: ', ret)
            this.emit('uuid', ret)
            this.state = Constant.STATE.uuid
            do {
                ret = await this.checkLogin()
                debug('checkLogin: ', ret)
                if (ret.code == 201 && ret.userAvatar) {
                    this.emit('user-avatar', ret.userAvatar)
                }
            } while (ret.code !== 200)
            await this.login()
            await this.init()
            await this.notifyMobile()
            ret = await this.getContact()
            debug('getContact data length: ', ret.length)
            this.updateContacts(ret)
        } catch (err) {
            this.emit('error', err)
            debug(err)
            this.logout()
            this.emit('logout')
            this.state = Constant.STATE.logout
            return
        }
        this.syncPolling(data => this.handleSync(data))
        this.emit('login')
        this.state = Constant.STATE.login
    }

    stop() {
        this.logout()
    }

    handleSync(data) {
        if (!data) {
            this.emit('logout')
            this.state = Constant.STATE.logout
            return
        }
        if (data.AddMsgCount) {
            debug('syncPolling messages count: ', data.AddMsgCount)
            this.handleMsg(data.AddMsgList)
        }
        if (data.ModContactCount) {
            debug('syncPolling ModContactList count: ', data.ModContactCount)
            this.updateContacts(data.ModContactList)
        }
    }

    handleMsg(data) {
        data.forEach(msg => {
            Promise.resolve().then(() => {
                if (!this.contacts[msg.FromUserName]) {
                    return this.batchGetContact([{
                        UserName: msg.FromUserName
                    }]).catch(err => {
                        debug(err)
                        return [{
                            UserName: msg.FromUserName
                        }]
                    }).then(contacts => {
                        this.updateContacts(contacts)
                    })
                }
            }).then(async () => {
                msg = await this.Message.create(msg)
                this.emit('message', msg)

                if (msg.MsgType == Constant.MSGTYPE_STATUSNOTIFY) {
                    let userList = msg.StatusNotifyUserName.split(',').map(UserName => {
                        return {
                            UserName: UserName
                        }
                    })
                    Promise.all(_.chunk(userList, 50).map(list => {
                        return this.batchGetContact(list).then(res => {
                            debug('batchGetContact data length: ', res.length)
                            this.updateContacts(res)
                        })
                    })).catch(err => {
                        debug(err)
                    })
                }
            }).catch(err => {
                this.emit('error', err)
                debug(err)
            })
        })
    }

    updateContacts(contacts) {
        let c = [];
        contacts.forEach(contact => {
            if (this.contacts[contact.UserName]) {
                // let wechatLayer = Object.getPrototypeOf(this.contacts[contact.UserName]);
                // for (let i in contact) {
                //     contact[i] || delete contact[i]
                // }
                // Object.assign(wechatLayer, contact)
                this.Contact.initContact(this.contacts[contact.UserName], contact)
            } else {
                this.contacts[contact.UserName] = this.Contact.create(contact)
            }
            if (this.Contact.isFriend(this.contacts[contact.UserName])) {
                c.push(this.contacts[contact.UserName]);
            }
        });
        this.emit('contacts-updated', c);
        this.fetchHeadImgs(c);
    }

    /**
     * 手机状态通知
     *
     * @param {any} [to]
     * @returns
     *
     * @memberOf Wechat
     */
    private notifyMobile(to?) {
        return Promise.resolve().then(() => {
            let params = {
                pass_ticket: this.PROP.passTicket,
                lang: 'zh_CN'
            }
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'Code': to ? 1 : 3,
                'FromUserName': this.user['UserName'],
                'ToUserName': to || this.user['UserName'],
                'ClientMsgId': Util.getClientMsgId()
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxstatusnotify,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('手机状态通知失败')
        })
    }


    /**
     * 获取通讯录
     *
     * @returns
     *
     * @memberOf Wechat
     */
    getContact() {
        return Promise.resolve().then(() => {
            let params = {
                'lang': 'zh_CN',
                'pass_ticket': this.PROP.passTicket,
                'seq': 0,
                'skey': this.PROP.skey,
                'r': +new Date()
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxgetcontact,
                params: params
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)

                return data.MemberList
            })
        }).catch(err => {
            console.log(err)
            throw new Error('获取通讯录失败')
        })
    }

    /**
     * 批量获取联系人
     *
     * @param {any} contacts
     * @returns
     *
     * @memberOf Wechat
     */
    batchGetContact(contacts) {
        return Promise.resolve().then(() => {
            let params = {
                'pass_ticket': this.PROP.passTicket,
                'type': 'ex',
                'r': +new Date(),
                'lang': 'zh_CN'
            }
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'Count': contacts.length,
                'List': contacts
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxbatchgetcontact,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)

                return data.ContactList
            })
        }).catch(err => {
            console.log(err)
            throw new Error('批量获取联系人失败')
        })
    }

    updateRemarkName(UserName, RemarkName) {
        return Promise.resolve().then(() => {
            let params = {
                pass_ticket: this.PROP.passTicket,
                'lang': 'zh_CN'
            }
            let data = {
                BaseRequest: this.getBaseRequest(),
                CmdId: 2,
                RemarkName: RemarkName,
                UserName: UserName
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxoplog,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            debug(err)
            throw new Error('设置用户标签失败')
        })
    }


    private syncCheck(): Promise<number> {
        return Promise.resolve().then(() => {
            let params = {
                'r': +new Date(),
                'sid': this.PROP.sid,
                'uin': this.PROP.uin,
                'skey': this.PROP.skey,
                'deviceid': Util.getDeviceID(),
                'synckey': this.PROP.formatedSyncKey
            }
            return this.request({
                method: 'GET',
                url: this.ApiPaths.API_synccheck,
                params: params
            }).then(res => {
                let window = {
                    synccheck: {}
                } as any;
                eval(res.data)
                Util.assert.equal(window.synccheck.retcode, Constant.SYNCCHECK_RET_SUCCESS, res)

                return +window.synccheck.selector
            })
        }).catch(err => {
            console.log(err)
            throw new Error('同步失败')
        })
    }

    private sync() {
        return Promise.resolve().then(() => {
            let params = {
                'sid': this.PROP.sid,
                'skey': this.PROP.skey,
                'pass_ticket': this.PROP.passTicket,
                'lang': 'zh_CN'
            }
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'SyncKey': this.PROP.syncKey,
                'rr': ~new Date()
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxsync,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)

                this.updateSyncKey(data)
                this.PROP.skey = data.SKey || this.PROP.skey
                return data
            })
        }).catch(err => {
            console.log(err)
            throw new Error('获取新信息失败')
        })
    }

    /**
     * 更新SyncKey
     *
     * @param {any} data
     *
     * @memberOf Wechat
     */
    private updateSyncKey(data) {
        if (data.SyncKey) {
            this.PROP.syncKey = data.SyncKey
        }
        if (data.SyncCheckKey) {
            let synckeylist = []
            for (let e = data.SyncCheckKey.List, o = 0, n = e.length; n > o; o++) {
                synckeylist.push(e[o]['Key'] + '_' + e[o]['Val'])
            }
            this.PROP.formatedSyncKey = synckeylist.join('|')
        } else if (!this.PROP.formatedSyncKey && data.SyncKey) {
            let synckeylist = []
            for (let e = data.SyncKey.List, o = 0, n = e.length; n > o; o++) {
                synckeylist.push(e[o]['Key'] + '_' + e[o]['Val'])
            }
            this.PROP.formatedSyncKey = synckeylist.join('|')
        }
    }

    /**
     * 退出
     * TODO: update state
     * @returns
     *
     * @memberOf Wechat
     */
    logout() {
        return Promise.resolve().then(() => {
            let params = {
                redirect: 1,
                type: 0,
                skey: this.PROP.skey,
                lang: 'zh_CN'
            }

            // data加上会出错，不加data也能登出
            // let data = {
            //   sid: this.PROP.sid,
            //   uin: this.PROP.uin
            // }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxlogout,
                params: params
            }).then(res => {
                return '登出成功'
            }).catch(err => {
                console.log(err)
                return '可能登出成功'
            })
        })
    }

    sendMsg(msg, to) {
        return this.sendText(msg, to)
    }

    sendText(content, to) {
        let msg = null as any;
        return Promise.resolve().then(() => {
            let params = {
                'pass_ticket': this.PROP.passTicket,
                'lang': 'zh_CN'
            }
            let clientMsgId = Util.getClientMsgId()
            msg = {
                'Type': Constant.MSGTYPE_TEXT,
                'Content': content,
                'FromUserName': this.user['UserName'],
                'ToUserName': to,
                'LocalID': clientMsgId,
                'ClientMsgId': clientMsgId
            }
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'Scene': 0,
                'Msg': msg
            }
            this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxsendmsg,
                params: params,
                data: data
            }).then(async res => {
                let data = res.data
                let success = data.BaseResponse.Ret == 0;
                if (success) {
                    msg['MsgID'] = data.MsgID;
                    msg['CreateTime'] = +new Date();
                    msg['Status'] = Constant.MSG_SEND_STATUS_SUCC
                    msg['MsgType'] = Constant.MSGTYPE_TEXT
                    let message = await this.Message.create(msg)
                    this.emit('message', message);
                }
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('发送文本信息失败')
        })
    }

    /**
     * 发送表情，可是是表情的MD5或者uploadMedia返回的mediaId
     *
     * @param {any} id
     * @param {any} to
     * @returns
     *
     * @memberOf Wechat
     */
    sendEmoticon(id, to) {
        return Promise.resolve().then(() => {
            let params = {
                'fun': 'sys',
                'pass_ticket': this.PROP.passTicket,
                'lang': 'zh_CN'
            }
            let clientMsgId = Util.getClientMsgId()
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'Scene': 0,
                'Msg': {
                    'Type': Constant.MSGTYPE_EMOTICON,
                    'EmojiFlag': 2,
                    'FromUserName': this.user['UserName'],
                    'ToUserName': to,
                    'LocalID': clientMsgId,
                    'ClientMsgId': clientMsgId
                }
            } as any;

            if (id.indexOf('@') === 0) {
                data.Msg.MediaId = id
            } else {
                data.Msg.EMoticonMd5 = id
            }

            this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxsendemoticon,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('发送表情信息失败')
        })
    }


    /**
     * 上传媒体文件
     *
     * @param {any} file Stream, Buffer, File
     * @param {any} filename
     * @param {string} [toUserName]
     * @returns
     *
     * @memberOf Wechat
     */
    uploadMedia(file, filename, toUserName?: string): Promise<any> {
        return Promise.resolve().then(() => {
            let name, type, size, ext, mediatype, data
            return new Promise((resolve, reject) => {
                if (Buffer.isBuffer(file)) {
                    if (!filename) {
                        return reject(new Error('文件名未知'))
                    }
                    name = filename
                    type = mime.lookup(name)
                    size = file.length
                    data = file
                    return resolve()
                } else if (file.readable) {
                    if (!file.path && !filename) {
                        return reject(new Error('文件名未知'))
                    }
                    name = path.basename(file.path || filename)
                    type = mime.lookup(name)
                    file.pipe(bl((err, buffer) => {
                        if (err) {
                            return reject(err)
                        }
                        size = buffer.length
                        data = buffer
                        return resolve()
                    }))
                }
            }).then(() => {
                ext = name.match(/.*\.(.*)/)
                if (ext) {
                    ext = ext[1]
                }

                switch (ext) {
                    case 'bmp':
                    case 'jpeg':
                    case 'jpg':
                    case 'png':
                        mediatype = 'pic'
                        break
                    case 'mp4':
                        mediatype = 'video'
                        break
                    default:
                        mediatype = 'doc'
                }

                let clientMsgId = Util.getClientMsgId()

                let uploadMediaRequest = JSON.stringify({
                    BaseRequest: this.getBaseRequest(),
                    ClientMediaId: clientMsgId,
                    TotalLen: size,
                    StartPos: 0,
                    DataLen: size,
                    MediaType: 4,
                    UploadType: 2,
                    FromUserName: this.user.UserName,
                    ToUserName: toUserName || this.user.UserName
                })

                let form = new FormData()
                form.append('name', name)
                form.append('type', type)
                form.append('lastModifiedDate', new Date().toUTCString())
                form.append('size', size)
                form.append('mediatype', mediatype)
                form.append('uploadmediarequest', uploadMediaRequest)
                form.append('webwx_data_ticket', this.PROP.webwxDataTicket)
                form.append('pass_ticket', encodeURI(this.PROP.passTicket))
                form.append('filename', data, {
                    filename: name,
                    contentType: type,
                    knownLength: size
                })
                return new Promise((resolve, reject) => {
                    form.pipe(bl((err, buffer) => {
                        if (err) {
                            return reject(err)
                        }
                        return resolve({
                            buffer: buffer,
                            headers: form.getHeaders()
                        })
                    }))
                })
            }).then((data: any) => {
                let params = {
                    f: 'json'
                }

                return this.request({
                    method: 'POST',
                    url: this.ApiPaths.API_webwxuploadmedia,
                    headers: data.headers,
                    params: params,
                    data: data.buffer
                })
            }).then(res => {
                let data = res.data
                let mediaId = data.MediaId
                Util.assert.ok(mediaId, res)

                return {
                    name: name,
                    size: size,
                    ext: ext,
                    mediatype: mediatype,
                    mediaId: mediaId
                }
            })
        }).catch(err => {
            console.log(err)
            throw new Error('上传媒体文件失败')
        })
    }

    sendPicture(filepath, to) {
        this.uploadMedia(fs.createReadStream(filepath), filepath)
            .then(res => {
                return this.sendPic(res.mediaId, to, filepath)
            })
            .catch(err => {
                console.log(err)
            });
    }

    /**
     * 发送图片，mediaId为uploadMedia返回的mediaId
     *
     * @param {any} mediaId
     * @param {any} to
     * @returns
     *
     * @memberOf Wechat
     */
    sendPic(mediaId, to, filePath?) {
        let msg = null;
        return Promise.resolve().then(() => {
            let params = {
                'pass_ticket': this.PROP.passTicket,
                'fun': 'async',
                'f': 'json',
                'lang': 'zh_CN'
            }
            let clientMsgId = Util.getClientMsgId()
            msg = {
                'Type': Constant.MSGTYPE_IMAGE,
                'MediaId': mediaId,
                'FromUserName': this.user.UserName,
                'ToUserName': to,
                'LocalID': clientMsgId,
                'ClientMsgId': clientMsgId
            };
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'Scene': 0,
                'Msg': msg
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxsendmsgimg,
                params: params,
                data: data
            }).then(async res => {
                let data = res.data
                let success = data.BaseResponse.Ret == 0;
                if (success) {
                    msg['MsgID'] = data.MsgID;
                    msg['CreateTime'] = +new Date();
                    msg['Status'] = Constant.MSG_SEND_STATUS_SUCC
                    msg['MsgType'] = Constant.MSGTYPE_IMAGE
                    if (filePath) {
                        msg['filePath'] = filePath;
                    }
                    let message = await this.Message.create(msg)
                    console.log(message);
                    this.emit('message', message);
                }
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('发送图片失败')
        })
    }

    /**
     * 发送视频
     *
     * @param {any} mediaId
     * @param {any} to
     * @returns
     *
     * @memberOf Wechat
     */
    sendVideo(mediaId, to) {
        return Promise.resolve().then(() => {
            let params = {
                'pass_ticket': this.PROP.passTicket,
                'fun': 'async',
                'f': 'json',
                'lang': 'zh_CN'
            }
            let clientMsgId = Util.getClientMsgId()
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'Scene': 0,
                'Msg': {
                    'Type': Constant.MSGTYPE_VIDEO,
                    'MediaId': mediaId,
                    'FromUserName': this.user.UserName,
                    'ToUserName': to,
                    'LocalID': clientMsgId,
                    'ClientMsgId': clientMsgId
                }
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxsendmsgvedio,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('发送视频失败')
        })
    }

    /**
     * 以应用卡片的形式发送文件，可以通过这个API发送语音
     *
     * @param {any} mediaId
     * @param {any} name
     * @param {any} size
     * @param {any} ext
     * @param {any} to
     * @returns
     *
     * @memberOf Wechat
     */
    sendDoc(mediaId, name, size, ext, to) {
        return Promise.resolve().then(() => {
            let params = {
                'pass_ticket': this.PROP.passTicket,
                'fun': 'async',
                'f': 'json',
                'lang': 'zh_CN'
            }
            let clientMsgId = Util.getClientMsgId()
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'Scene': 0,
                'Msg': {
                    'Type': Constant.APPMSGTYPE_ATTACH,
                    'Content': `<appmsg appid='wxeb7ec651dd0aefa9' sdkver=''><title>${name}</title><des></des><action></action><type>6</type><content></content><url></url><lowurl></lowurl><appattach><totallen>${size}</totallen><attachid>${mediaId}</attachid><fileext>${ext}</fileext></appattach><extinfo></extinfo></appmsg>`,
                    'FromUserName': this.user.UserName,
                    'ToUserName': to,
                    'LocalID': clientMsgId,
                    'ClientMsgId': clientMsgId
                }
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxsendappmsg,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('发送文件失败')
        })
    }

    /**
     * 获取图片或表情
     *
     * @param {any} msgId
     * @returns
     *
     * @memberOf Wechat
     */
    getMsgImg(msgId) {
        return Promise.resolve().then(() => {
            let params = {
                MsgID: msgId,
                skey: this.PROP.skey,
                type: 'big'
            }

            return this.request({
                method: 'GET',
                url: this.ApiPaths.API_webwxgetmsgimg,
                params: params,
                responseType: 'arraybuffer'
            }).then(res => {
                return {
                    data: res.data,
                    type: res.headers['content-type']
                }
            })
        }).catch(err => {
            console.log(err)
            throw new Error('获取图片或表情失败')
        })
    }

    /**
     * 获取小视频或视频
     *
     * @param {any} msgId
     * @returns
     *
     * @memberOf Wechat
     */
    getVideo(msgId) {
        return Promise.resolve().then(() => {
            let params = {
                MsgID: msgId,
                skey: this.PROP.skey
            }

            return this.request({
                method: 'GET',
                url: this.ApiPaths.API_webwxgetvideo,
                headers: {
                    'Range': 'bytes=0-'
                },
                params: params,
                responseType: 'arraybuffer'
            }).then(res => {
                return {
                    data: res.data,
                    type: res.headers['content-type']
                }
            })
        }).catch(err => {
            console.log(err)
            throw new Error('获取视频失败')
        })
    }


    /**
     * 获取语音
     *
     * @param {string} msgId
     * @returns
     *
     * @memberOf Wechat
     */
    getVoice(msgId: string) {
        return Promise.resolve().then(() => {
            let params = {
                MsgID: msgId,
                skey: this.PROP.skey
            }

            return this.request({
                method: 'GET',
                url: this.ApiPaths.API_webwxgetvoice,
                params: params,
                responseType: 'arraybuffer'
            }).then(res => {
                return {
                    data: res.data,
                    type: res.headers['content-type']
                }
            })
        }).catch(err => {
            console.log(err)
            throw new Error('获取声音失败')
        })
    }

    /**
     * 获取联系人头像
     *
     * @param {string} HeadImgUrl
     * @returns
     *
     * @memberOf Wechat
     */
    getHeadImg(HeadImgUrl: string) {
        return Promise.resolve().then(() => {
            let url = this.ApiPaths.origin + HeadImgUrl
            return this.request({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer'
            }).then(res => {
                return {
                    data: res.data,
                    type: res.headers['content-type']
                }
            })
        }).catch(err => {
            console.log(err)
            throw new Error('获取头像失败')
        })
    }

    /**
     * 通过好友添加请求
     *
     * @param {string} UserName
     * @param {string} Ticket
     * @returns
     *
     * @memberOf Wechat
     */
    verifyUser(UserName: string, Ticket: string) {
        return Promise.resolve().then(() => {
            let params = {
                'pass_ticket': this.PROP.passTicket,
                'lang': 'zh_CN'
            }
            let data = {
                'BaseRequest': this.getBaseRequest(),
                'Opcode': 3,
                'VerifyUserListSize': 1,
                'VerifyUserList': [{
                    'Value': UserName,
                    'VerifyUserTicket': Ticket
                }],
                'VerifyContent': '',
                'SceneListCount': 1,
                'SceneList': [33],
                'skey': this.PROP.skey
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxverifyuser,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('通过好友请求失败')
        })
    }

    /**
     * 同步
     *
     * @private
     * @param {any} callback
     *
     * @memberOf Wechat
     */
    private syncPolling(callback) {
        this.syncCheck().then(selector => {
            debug('Sync Check Selector: ', selector)
            if (selector !== Constant.SYNCCHECK_SELECTOR_NORMAL) {
                return this.sync().then(data => {
                    this.syncErrorCount = 0
                    callback(data)
                })
            }
        }).then(() => {
            this.syncPolling(callback)
            if (+new Date() - this.lastReportTime > 5 * 60 * 1000) {
                debug('Status Report')
                this.notifyMobile(this.user.UserName)
                    .catch(debug)
                this.sendText('心跳：' + new Date().toLocaleString(), 'filehelper')
                    .catch(debug)
                this.lastReportTime = +new Date()
            }
        }).catch(err => {
            this.emit('error', err)
            if (this.syncErrorCount++ > 5) {
                debug(err)
                this.logout()
                callback()
            } else {
                setTimeout(() => {
                    this.syncPolling(callback)
                }, 1000 * this.syncErrorCount)
            }
        })
    }

    /**
     * 登录流程：检测扫码登录
     *
     * @returns
     *
     * @memberOf Wechat
     */
    private checkLogin() {
        return Promise.resolve().then(() => {
            let params = {
                'tip': 0,
                'uuid': this.PROP.uuid,
                'loginicon': true
            }
            return this.request({
                method: 'GET',
                url: this.ApiPaths.API_login,
                params: params
            }).then(res => {
                let window = {} as any;
                eval(res.data)
                Util.assert.notEqual(window.code, 400, res)
                if (window.code == 200) {
                    this.ApiPaths = getApiPaths(window.redirect_uri.match(/(?:\w+\.)+\w+/)[0])
                    this.rediUri = window.redirect_uri
                } else if (window.code == 201 && window.userAvatar) {
                    this.user.userAvatar = window.userAvatar
                }
                return window
            })
        }).catch(err => {
            console.log(err)
            throw new Error('获取手机确认登录信息失败')
        })
    }

    /**
       * 登录流程：获取UUID
       *
       * @private
       * @returns
       *
       * @memberOf Wechat
       */
    private getUUID() {
        return Promise.resolve().then(() => {
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_jsLogin
            }).then(res => {
                let window = {
                    QRLogin: {}
                } as any;
                eval(res.data) // Evil
                Util.assert.equal(window.QRLogin.code, 200, res)

                return this.PROP.uuid = window.QRLogin.uuid
            })
        }).catch(err => {
            console.log(err);
            throw new Error('获取UUID失败')
        })
    }

    /**
     * 登录流程：登录
     *
     * @returns
     *
     * @memberOf Wechat
     */
    private login() {
        return Promise.resolve().then(() => {
            return this.request({
                method: 'GET',
                url: this.rediUri,
                params: {
                    fun: 'new'
                }
            }).then(res => {
                let pm = res.data.match(/<ret>(.*)<\/ret>/)
                if (pm && pm[1] === '0') {
                    this.PROP.skey = res.data.match(/<skey>(.*)<\/skey>/)[1]
                    this.PROP.sid = res.data.match(/<wxsid>(.*)<\/wxsid>/)[1]
                    this.PROP.uin = res.data.match(/<wxuin>(.*)<\/wxuin>/)[1]
                    this.PROP.passTicket = res.data.match(/<pass_ticket>(.*)<\/pass_ticket>/)[1]
                }
                if (res.headers['set-cookie']) {
                    res.headers['set-cookie'].forEach(item => {
                        if (/webwx.*?data.*?ticket/i.test(item)) {
                            this.PROP.webwxDataTicket = item.match(/=(.*?);/)[1]
                        } else if (/wxuin/i.test(item)) {
                            this.PROP.uin = item.match(/=(.*?);/)[1]
                        } else if (/wxsid/i.test(item)) {
                            this.PROP.sid = item.match(/=(.*?);/)[1]
                        }
                    })
                }
            })
        }).catch(err => {
            console.log(err)
            throw new Error('登录失败')
        })
    }

    /**
     * 登录流程：微信初始化
     *
     * @returns
     *
     * @memberOf Wechat
     */
    private init() {
        return Promise.resolve().then(() => {
            let params = {
                'pass_ticket': this.PROP.passTicket,
                'skey': this.PROP.skey,
                'r': ~new Date()
            }
            let data = {
                BaseRequest: this.getBaseRequest()
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxinit,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
                this.PROP.skey = data.SKey || this.PROP.skey
                this.updateSyncKey(data)
                Object.assign(this.user, data.User)
                return this.user
            })
        }).catch(err => {
            console.log(err)
            throw new Error('微信初始化失败')
        })
    }
    // fun: 'addmember' or 'delmember' or 'invitemember'
    // We don't need this now
    private updateChatroom(ChatRoomName, MemberList, fun) {
        return Promise.resolve().then(() => {
            let params = {
                fun: fun
            }
            let data = {
                BaseRequest: this.getBaseRequest(),
                ChatRoomName: ChatRoomName
            } as any;
            if (fun == 'addmember') {
                data.AddMemberList = MemberList.toString()
            } else if (fun == 'delmember') {
                data.DelMemberList = MemberList.toString()
            } else if (fun == 'invitemember') {
                data.InviteMemberList = MemberList.toString()
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxupdatechatroom,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('邀请或踢出群成员失败')
        })
    }

    // OP: 1 联系人置顶 0 取消置顶
    opLog(UserName, OP) {
        return Promise.resolve().then(() => {
            let params = {
                pass_ticket: this.PROP.passTicket
            }
            let data = {
                BaseRequest: this.getBaseRequest(),
                CmdId: 3,
                OP: OP,
                UserName: UserName
            }
            return this.request({
                method: 'POST',
                url: this.ApiPaths.API_webwxoplog,
                params: params,
                data: data
            }).then(res => {
                let data = res.data
                Util.assert.equal(data.BaseResponse.Ret, 0, res)
            })
        }).catch(err => {
            console.log(err)
            throw new Error('置顶或取消置顶失败')
        })
    }

    private getBaseRequest(): InternalTypes.BaseRequest {
        return {
            Uin: parseInt(this.PROP.uin),
            Sid: this.PROP.sid,
            Skey: this.PROP.skey,
            DeviceID: Util.getDeviceID() // 每次都不同
        }
    }

    private async fetchHeadImgs(contacts: Types.Contact[]) {
        for (let c of contacts) {
            let filepath = await this.Contact.getHeadImage(c);
            if (filepath) {
                this.emit('contact-avatar', c.UserName, filepath);
            }
        }
    }
}

Wechat.STATE = Constant.STATE


export default Wechat;
