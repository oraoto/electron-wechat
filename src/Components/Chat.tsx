import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { State } from '../Reducers';
import * as Types from '../Reducers/Wechat/Types';
import * as MessageType from '../Reducers/Wechat/Types/MessageType';

import Message from './Message';

interface OwnProps {
    messages: Types.AllMessage[],
    user: Types.User,
    contact: Types.Contact,
    send_text: (uin, username, content) => void,
    height: number,
    send_image: (uin, username, filepath) => void,
}

interface OwnState { }
interface ConnectedState { }
interface ConnectedDispatch { }
type ChatProps = ConnectedState & ConnectedDispatch & OwnProps

import '../../assets/chat/css/style.css';

import ChatInput from './ChatInput';

class Chat extends React.Component<ChatProps, OwnState> {

    componentDidUpdate() {
        let list = this.refs['message-list'] as HTMLDivElement;
        let bottom = this.refs['message-bottom'] as HTMLDivElement;
        list.scrollTop = bottom.offsetTop;
    }

    render() {
        let messages = this.props.messages.filter((m) =>
            (m.MsgType == MessageType.Text
                || m.MsgType == MessageType.Image
                || m.MsgType == MessageType.Video
                || m.MsgType == MessageType.Voice
            )
        );
        return (
            <div className="box chat" style={{ flex: 1 }}>
                <div className="box_hd">
                    <div className="title_wrap">
                        <div className="title">
                            <a href="javascript:;" className="title_name">{this.props.contact.RemarkName || this.props.contact.NickName}</a>
                        </div>
                    </div>
                </div>

                <div className="scroll-wrapper">
                    <div className="box_hd scroll-content" ref="message-list"
                        style={{ height: this.props.height - 51 - 150 - 20 }}>
                        <div className="content_scroll">

                            {
                                messages.map((m) => {

                                    let me = m.isSendBySelf ? "me" : "you";
                                    let avatar = m.isSendBySelf ? this.props.user.userAvatar : this.props.contact.userAvatar;
                                    let cls = m.isSendBySelf ? "bubble bubble_primary right" : "bubble bubble_default right"

                                    return (
                                        <div className="lt_item" key={'' + m.CreateTime + m.MsgId}>
                                            <div className={"message " + me}>
                                                <img className="avatar" src={avatar} alt="" />
                                                <div className="content">
                                                    <div className={cls}>
                                                        <div className="bubble_cont">
                                                            <Message message={m} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                            <div className="lt_item"><div className="message you" ref='message-bottom'></div></div>
                        </div>
                    </div>
                </div>

                <ChatInput
                    send_text={this.props.send_text}
                    contact={this.props.contact}
                    user={this.props.user}
                    send_image={this.props.send_image} />
            </div>
        );
    }
}

const mapStateToProps = (state: State, ownProps: OwnProps): ConnectedState => ({

});
const mapDispatchToProps = (dispatch: Redux.Dispatch<State>): ConnectedDispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
