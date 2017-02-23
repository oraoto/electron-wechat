import { remote } from 'electron'
import * as Redux from 'redux';
import * as path from 'path';
import Wechat from './Client';
import * as WechatRedux from './index';
import * as Types from './Types';

export default class WechatAdapter {
    store: Redux.Store<{}>
    wechats: {}

    constructor(store) {
        this.store = store;
        this.wechats = {};
    }

    newWechat() {
        let wechat = new Wechat();
        let Uin = 0;

        let qrWindow: Electron.BrowserWindow;
        wechat.on('uuid', (uuid) => {
            let url = 'https://login.weixin.qq.com/qrcode/' + uuid;
            qrWindow = new remote.BrowserWindow({
                width: 350,
                height: 380,
                autoHideMenuBar: true,
                title: '扫描二维码登录'
            });
            qrWindow.loadURL(url);
            qrWindow.webContents.on('did-finish-load', () => {
                qrWindow.setTitle('扫描二维码登录');
                qrWindow.webContents.insertCSS('img{width: 100%; height: 100%}');
            });
            qrWindow.on('close', () => {
                if (wechat.state != 'login') {
                    wechat.stop();
                }
            });
        });

        wechat.on('login', () => {
            Uin = wechat.user.Uin;
            this.wechats[Uin] = wechat;
            this.store.dispatch(WechatRedux.loginSuccess(Uin, wechat.user));
            qrWindow.close();
        });

        wechat.on('logout', () => {
            this.store.dispatch(WechatRedux.logoutSuccess(Uin));
        });

        wechat.on('contacts-updated', (contacts) => {
            this.store.dispatch(WechatRedux.contactsUpdated(Uin, contacts));
        });

        wechat.on('message', (message: Types.AllMessage) => {
            this.store.dispatch(WechatRedux.receiveMessage(Uin, message));
        });

        wechat.on('error', (err) => {
            this.store.dispatch(WechatRedux.error(Uin, err));
        });

        wechat.on('contact-avatar', (username, filepath) => {
            this.store.dispatch(WechatRedux.updateContactAvatar(username, filepath))
        });

        wechat.start();
    }

    find(Uin): Wechat {
        return this.wechats[Uin];
    }

}