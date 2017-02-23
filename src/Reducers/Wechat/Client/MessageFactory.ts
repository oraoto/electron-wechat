import Wechat from './Wechat';
import * as MessageType from '../Types/MessageType';
import * as Util from './Util';
import { Contact } from '../Types/Contact';
import * as Message from '../Types/Message';
import * as fs from 'fs';
import * as path from 'path';
import * as Config from '../../../Config';

export default class MessageFactory {
    wechat: Wechat;

    constructor(wechat: Wechat) {
        this.wechat = wechat;
    }

    handleImageMessage(message: Message.ImageMessage) {
        if (message.filePath) {
            return message;
        }
        let filePath = path.resolve(path.join(Config.CACHE_DIR, "img", `${message.MsgId}.jpg`));
        message.filePath = filePath;

        return this.wechat.getMsgImg(message.MsgId).then(res => {
            fs.writeFileSync(filePath, res.data);
            return message;
        }).catch(err => {
            return message;
        })
    }

    handleVoiceMessage(message: Message.VoiceMessage) {
        if (message.filePath) {
            return message;
        }
        let filePath = path.resolve(path.join(Config.CACHE_DIR, "voice", `${message.MsgId}.mp3`));
        message.filePath = filePath;

        return this.wechat.getVoice(message.MsgId).then(res => {
            fs.writeFileSync(filePath, res.data);
            return message;
        }).catch(err => {
            return message;
        })
    }

    handleVideoMessage(message: Message.VideoMessage) {
        if (message.filePath) {
            return message;
        }
        let filePath = path.resolve(path.join(Config.CACHE_DIR, "video", `${message.MsgId}.mp4`));
        message.filePath = filePath;

        return this.wechat.getVideo(message.MsgId).then(res => {
            fs.writeFileSync(filePath, res.data);
            return message;
        }).catch(err => {
            return message;
        })
    }

    async create(messageData) {
        let message = {} as Message.AllMessage;
        Object.assign(message, messageData);

        message.MsgType = (+message.MsgType) as MessageType.MessageType;
        message.isSendBySelf = message.FromUserName === this.wechat.user.UserName || message.FromUserName === ''
        message.originalContent = message.Content;

        if (message.Content) {
            message.Content = message.Content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<br\/>/g, '\n')
            message.Content = Util.convertEmoji(message.Content)
        }

        switch (message.MsgType) {
            case MessageType.Image:
                await this.handleImageMessage(message);
                break;
            case MessageType.Voice:
                await this.handleVoiceMessage(message);
                break;
            case MessageType.Video:
                await this.handleVideoMessage(message);
                break;
        }
        return message;
    }
}