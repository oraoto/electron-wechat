import Constant from './Constant'
import { convertEmoji } from './Util'
import Wechat from './Wechat';
import * as Config from '../../../Config'; // TODO: should be inject
import { Contact } from '../Types/Contact';
import * as fs from 'fs';
import * as path from 'path';

export default class ContactFactory {
    instance: Wechat;

    constructor(instance: Wechat) {
        this.instance = instance;
    }

    isRoomContact(contact: Contact) {
        return contact.UserName ? /^@@|@chatroom$/.test(contact.UserName) : false;
    }

    isPublicContact(contact: Contact) {
        return contact.VerifyFlag & Constant.MM_USERATTRVERIFYFALG_BIZ_BRAND
    }

    isSpConcat(contact: Contact) {
        return Constant.SPECIALUSERS.indexOf(contact.UserName) >= 0
    }

    isFriend(contact: Contact) {
        return !this.isRoomContact(contact) && !this.isSpConcat(contact) && !this.isPublicContact(contact);
    }

    getDisplayName(contact: Contact): string {
        if (this.isRoomContact(contact)) {
            return '[群] ' + (contact.RemarkName || contact.DisplayName || contact.NickName ||
                `${this.getDisplayName(contact.MemberList[0])}、${this.getDisplayName(contact.MemberList[1])}`);
        } else {
            return (contact.DisplayName || contact.RemarkName || contact.NickName || contact.UserName);
        }
    }

    isSelf(contact: Contact) {
        return contact.isSelf || contact.UserName === this.instance.user.UserName;
    }

    getUserByUserName(userName: string) {
        return this.instance.contacts[userName];
    }

    canSearch(contact: Contact, keyword: string) {
        return true;
    }

    getSearchUser(keyword: string) {
        let users = []
        for (let key in this.instance.contacts) {
            if (this.canSearch(this.instance.contacts[key], keyword)) {
                users.push(this.instance.contacts[key])
            }
        }
        return users
    }

    async getHeadImage(contact: Contact) {
        let filePath = path.resolve(path.join(Config.CACHE_DIR, "head", `${contact.UserName}.png`));
        let exist = fs.existsSync(filePath); // sync
        if (exist) {
            return filePath;
        }
        return await this.instance.getHeadImg(contact.HeadImgUrl).then(res => {
            fs.writeFileSync(filePath, res.data);
            return filePath
        }).catch(err => {
            console.log(err);
            return null;
        })
    }

    initContact(contact: Contact, originData: any) {
        let wechat = this.instance;
        contact.NickName = convertEmoji(originData.NickName)
        contact.RemarkName = convertEmoji(originData.RemarkName)
        contact.DisplayName = convertEmoji(originData.DisplayName)
        contact.isSelf = contact.UserName === wechat.user.UserName;
        contact.fromUserUin = wechat.user.Uin;
        contact.displayName = this.getDisplayName(contact);
        contact.sort_name = contact.RemarkPYQuanPin || contact.RemarkPYInitial || contact.PYInitial || contact.NickName
        contact.sort_name = contact.sort_name.toLowerCase();
        return;
    }

    create(contactData) {
        let contact = new Contact();
        Object.assign(contact, contactData);
        this.initContact(contact, contactData);
        return contact;
    }
}