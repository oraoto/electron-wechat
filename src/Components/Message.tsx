import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { State } from '../Reducers';
import * as Types from '../Reducers/Wechat/Types';
import * as MessageType from '../Reducers/Wechat/Types/MessageType';

interface OwnProps {
    message: Types.AllMessage
}
interface OwnState { }
type MessageProps = OwnProps

class Message extends React.Component<MessageProps, OwnState> {

    render() {
        let message = this.props.message;

        switch (message.MsgType) {
            case MessageType.Text:
                return (
                    <div key={message.MsgId} className="plain">
                        <pre>{message.Content}</pre>
                    </div>
                );
            case MessageType.Image:
                return (
                    <div key={message.MsgId}  className="plain">
                        <img src={message.filePath}
                            width={(message.ImgWidth || 100)* 2.5}
                            height={(message.ImgHeight || 100) * 2.5}
                            />
                    </div>
                )
            case MessageType.Video: {
                let src = "file:///" + message.filePath;
                return (
                    <div key={message.MsgId} className="plain">
                        <video src={src} controls={true} autoPlay={false}
                            width={message.ImgWidth  / 2}
                            height={message.ImgHeight / 2}
                            ></video>
                    </div>
                )
            }
            case MessageType.Voice: {
                let src = "file:///" + message.filePath;
                return (
                    <div key={message.MsgId} className="plain">
                        <audio src={src} controls={true} autoPlay={false}></audio>
                    </div>
                )
            }
            default:
                return <h1>{message.Content}</h1>;
        }

    }

}

export default Message;
