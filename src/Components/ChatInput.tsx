import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { State } from '../Reducers';
import * as Types from '../Reducers/Wechat/Types';
import { Button, Icon, Popover, Input } from 'antd';
import * as Electron from 'electron';
import * as ChatInputReducer from '../Reducers/ChatInput';
import * as delegate from 'delegate-to'

require('../../assets/qq_face.css');

const {dialog} = require('electron').remote

interface OwnProps {
    user: Types.User,
    contact: Types.Contact,
    send_text: (uin, username, content) => void,
    send_image: (uin, username, filepath) => void,
}
interface OwnState { }
interface ConnectedState {
    chat_input: string
}
interface ConnectedDispatch {
    update_input: (string) => void,
    append_input: (string) => void
}
type ChatInputProps = ConnectedState & ConnectedDispatch & OwnProps

class ChatInput extends React.Component<ChatInputProps, OwnState> {

    handleSend() {
        let textarea = this.refs['textarea'] as Input;
        if (textarea.props.value.length > 0) {
            this.props.send_text(this.props.user.Uin, this.props.contact.UserName,textarea.props.value);
        }
        this.props.update_input('');
    }

    handleSendImage() {
        let file_path = dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: '图片', extensions: ['png', 'PNG', 'jpg', 'jpeg', 'JPG', 'JPEG', 'gif', 'GIF']}]
        });
        if (!file_path) {
            return;
        }
        this.props.send_image(this.props.user.Uin, this.props.contact.UserName, file_path[0]);
    }

    handleUpdate(e) {
        this.props.update_input(e.target.value);
    }

    handleQQFace(e) {
        this.props.append_input('[' + e.delegateTarget.innerText + ']');
    }

    render() {

        let qq_emojis =
            <div className="qq_face" onClick={delegate('.face', this.handleQQFace.bind(this))} >
                <div>
                    <a title="微笑" type="qq" className="face qqface0">微笑</a>
                    <a title="撇嘴" type="qq" className="face qqface1">撇嘴</a>
                    <a title="色" type="qq" className="face qqface2">色</a>
                    <a title="发呆" type="qq" className="face qqface3">发呆</a>
                    <a title="得意" type="qq" className="face qqface4">得意</a>
                    <a title="流泪" type="qq" className="face qqface5">流泪</a>
                    <a title="害羞" type="qq" className="face qqface6">害羞</a>
                    <a title="闭嘴" type="qq" className="face qqface7">闭嘴</a>
                    <a title="睡" type="qq" className="face qqface8">睡</a>

                    <a title="大哭" type="qq" className="face qqface9">大哭</a>
                    <a title="尴尬" type="qq" className="face qqface10">尴尬</a>
                    <a title="发怒" type="qq" className="face qqface11">发怒</a>
                    <a title="调皮" type="qq" className="face qqface12">调皮</a>
                    <a title="呲牙" type="qq" className="face qqface13">呲牙</a>
                    <a title="惊讶" type="qq" className="face qqface14">惊讶</a>
                </div>
                <div>
                    <a title="难过" type="qq" className="face qqface15">难过</a>
                    <a title="酷" type="qq" className="face qqface16">酷</a>

                    <a title="冷汗" type="qq" className="face qqface17">冷汗</a>
                    <a title="抓狂" type="qq" className="face qqface18">抓狂</a>
                    <a title="吐" type="qq" className="face qqface19">吐</a>
                    <a title="偷笑" type="qq" className="face qqface20">偷笑</a>
                    <a title="愉快" type="qq" className="face qqface21">愉快</a>
                    <a title="白眼" type="qq" className="face qqface22">白眼</a>
                    <a title="傲慢" type="qq" className="face qqface23">傲慢</a>
                    <a title="饥饿" type="qq" className="face qqface24">饥饿</a>
                    <a title="困" type="qq" className="face qqface25">困</a>

                    <a title="惊恐" type="qq" className="face qqface26">惊恐</a>
                    <a title="流汗" type="qq" className="face qqface27">流汗</a>
                    <a title="憨笑" type="qq" className="face qqface28">憨笑</a>
                    <a title="悠闲" type="qq" className="face qqface29">悠闲</a>
                </div>
                <div>
                    <a title="奋斗" type="qq" className="face qqface30">奋斗</a>
                    <a title="咒骂" type="qq" className="face qqface31">咒骂</a>
                    <a title="疑问" type="qq" className="face qqface32">疑问</a>
                    <a title="嘘" type="qq" className="face qqface33">嘘</a>

                    <a title="晕" type="qq" className="face qqface34">晕</a>
                    <a title="疯了" type="qq" className="face qqface35">疯了</a>
                    <a title="衰" type="qq" className="face qqface36">衰</a>
                    <a title="骷髅" type="qq" className="face qqface37">骷髅</a>
                    <a title="敲打" type="qq" className="face qqface38">敲打</a>
                    <a title="再见" type="qq" className="face qqface39">再见</a>
                    <a title="擦汗" type="qq" className="face qqface40">擦汗</a>
                    <a title="抠鼻" type="qq" className="face qqface41">抠鼻</a>
                    <a title="鼓掌" type="qq" className="face qqface42">鼓掌</a>
                    <a title="糗大了" type="qq" className="face qqface43">糗大了</a>
                    <a title="坏笑" type="qq" className="face qqface44">坏笑</a>
                </div>
                <div>
                    <a title="左哼哼" type="qq" className="face qqface45">左哼哼</a>
                    <a title="右哼哼" type="qq" className="face qqface46">右哼哼</a>
                    <a title="哈欠" type="qq" className="face qqface47">哈欠</a>

                    <a title="鄙视" type="qq" className="face qqface48">鄙视</a>
                    <a title="委屈" type="qq" className="face qqface49">委屈</a>
                    <a title="快哭了" type="qq" className="face qqface50">快哭了</a>
                    <a title="阴险" type="qq" className="face qqface51">阴险</a>
                    <a title="亲亲" type="qq" className="face qqface52">亲亲</a>
                    <a title="吓" type="qq" className="face qqface53">吓</a>
                    <a title="可怜" type="qq" className="face qqface54">可怜</a>
                    <a title="菜刀" type="qq" className="face qqface55">菜刀</a>
                    <a title="西瓜" type="qq" className="face qqface56">西瓜</a>
                    <a title="啤酒" type="qq" className="face qqface57">啤酒</a>
                    <a title="篮球" type="qq" className="face qqface58">篮球</a>
                    <a title="乒乓" type="qq" className="face qqface59">乒乓</a>
                </div>
                <div>
                    <a title="咖啡" type="qq" className="face qqface60">咖啡</a>
                    <a title="饭" type="qq" className="face qqface61">饭</a>

                    <a title="猪头" type="qq" className="face qqface62">猪头</a>
                    <a title="玫瑰" type="qq" className="face qqface63">玫瑰</a>
                    <a title="凋谢" type="qq" className="face qqface64">凋谢</a>
                    <a title="嘴唇" type="qq" className="face qqface65">嘴唇</a>
                    <a title="爱心" type="qq" className="face qqface66">爱心</a>
                    <a title="心碎" type="qq" className="face qqface67">心碎</a>
                    <a title="蛋糕" type="qq" className="face qqface68">蛋糕</a>
                    <a title="闪电" type="qq" className="face qqface69">闪电</a>
                    <a title="炸弹" type="qq" className="face qqface70">炸弹</a>
                    <a title="刀" type="qq" className="face qqface71">刀</a>

                    <a title="足球" type="qq" className="face qqface72">足球</a>
                    <a title="瓢虫" type="qq" className="face qqface73">瓢虫</a>
                    <a title="便便" type="qq" className="face qqface74">便便</a>
                </div>
                <div>
                    <a title="月亮" type="qq" className="face qqface75">月亮</a>
                    <a title="太阳" type="qq" className="face qqface76">太阳</a>
                    <a title="礼物" type="qq" className="face qqface77">礼物</a>
                    <a title="拥抱" type="qq" className="face qqface78">拥抱</a>
                    <a title="强" type="qq" className="face qqface79">强</a>
                    <a title="弱" type="qq" className="face qqface80">弱</a>
                    <a title="握手" type="qq" className="face qqface81">握手</a>
                    <a title="胜利" type="qq" className="face qqface82">胜利</a>
                    <a title="抱拳" type="qq" className="face qqface83">抱拳</a>
                    <a title="勾引" type="qq" className="face qqface84">勾引</a>
                    <a title="拳头" type="qq" className="face qqface85">拳头</a>
                    <a title="差劲" type="qq" className="face qqface86">差劲</a>
                    <a title="爱你" type="qq" className="face qqface87">爱你</a>
                    <a title="NO" type="qq" className="face qqface88">NO</a>
                    <a title="OK" type="qq" className="face qqface89">OK</a>
                </div>
                <div>
                    <a title="爱情" type="qq" className="face qqface90">爱情</a>
                    <a title="飞吻" type="qq" className="face qqface91">飞吻</a>
                    <a title="跳跳" type="qq" className="face qqface92">跳跳</a>
                    <a title="发抖" type="qq" className="face qqface93">发抖</a>
                    <a title="怄火" type="qq" className="face qqface94">怄火</a>
                    <a title="转圈" type="qq" className="face qqface95">转圈</a>
                    <a title="磕头" type="qq" className="face qqface96">磕头</a>
                    <a title="回头" type="qq" className="face qqface97">回头</a>
                    <a title="跳绳" type="qq" className="face qqface98">跳绳</a>
                    <a title="投降" type="qq" className="face qqface99">投降</a>
                    <a title="激动" type="qq" className="face qqface100">激动</a>
                    <a title="乱舞" type="qq" className="face qqface101">乱舞</a>
                    <a title="献吻" type="qq" className="face qqface102">献吻</a>
                    <a title="左太极" type="qq" className="face qqface103">左太极</a>
                    <a title="右太极" type="qq" className="face qqface104">右太极</a>
                </div>
            </div>;

        return (
            <div className="box_ft">
                {true ? <div className="toolbar">
                    <Button icon="picture" size="large" onClick={this.handleSendImage.bind(this)}></Button>
                    <Popover content={qq_emojis} title="表情">
                        <Button icon="smile" size="large"></Button>
                    </Popover>

                </div> : null}
                <div className="content">
                    <Input type="textarea" className="flex"
                        onChange={this.handleUpdate.bind(this)}
                        value={this.props.chat_input}
                        onPressEnter={this.handleSend.bind(this)}
                        ref="textarea" />

                </div>
                <div className="action">
                    <a className="btn" onClick={this.handleSend.bind(this)}>发送</a>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: State, ownProps: OwnProps): ConnectedState => ({
    chat_input: state.chat_input
});
const mapDispatchToProps = (dispatch: Redux.Dispatch<State>): ConnectedDispatch => ({
    update_input: (contnet) => dispatch(ChatInputReducer.update(contnet)),
    append_input: (content) => dispatch(ChatInputReducer.append(content))
})

export default connect(mapStateToProps, mapDispatchToProps)(ChatInput);