import styled from "styled-components";
import { ITweet, IReply } from "./timeline";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import axiosConfig from "../api/axios"
import { useDispatch, useSelector } from "react-redux";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'
import DOMPurify from 'dompurify';
import Reply from "./reply";

const Wrapper = styled.div<{isMyself:boolean}>`
    padding: 20px;
    border: 2px solid ${props => props.isMyself ? '#b2e0ff' : 'rgba(255,255,255,0.5)'};
    border-radius: 15px;
`;

const Column = styled.div`
    &.photoBox {
        margin-left: 10%;
    }
`;

const Username = styled.span`
    font-weight: 600;
    font-size: 15px;
`;

const Payload = styled.div`
    position: relative;
    margin: 10px 0px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    min-height: 30px;
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;

    /* Payload 아래의 iframe에 적용 */
    iframe {
        display: block;
        max-width: 100%;
        width: 100%;
        aspect-ratio: 16 / 9;
        height: auto;
        border: 0;
    }

    img {
        max-width: 100%;
        height: auto;
    }
`;

const BasicButton = styled.button`
    background-color: dodgerblue;
    margin-right: 0.5%;
    color: white;
    font-weight: 600;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    &.cancelBtn {
        background-color: inherit;
        color: dodgerblue;
        border-color: white;
    }
    &.editSubmitBtn {
        background-color: dodgerblue;
        color: white;
        float: right;
    }
    &.reply_button{
        background-color: white;
        color: dodgerblue;
    }
    &.reply_add_button{
        margin: 0 5px;
        min-width: 50px;
    }
`;

const TextArea = styled.textarea`
    position: relative;
    border: 2px solid white;
    padding: 5px;
    border-radius: 10px;
    font-size: 14px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    &::placeholder {
        font-size: 14px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

const StyledQuill = styled(ReactQuill)`
    margin: 5px 0;
    .ql-container {
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }
    .ql-toolbar {
        background-color: #b2e0ff;
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
    }
    .ql-editor {
        font-family: 'CookieRun', sans-serif;
        min-height: 120px;
        font-size: 1.2em;
        //강제 줄바꿈
        white-space: normal;
        word-break: break-all; 
        overflow-wrap: break-word; 
        word-wrap: break-word; 
        &:focus {
            border: solid 1px;
            border-color: #1d9bf0;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
        }
    }
`;

const ReplyDiv = styled.div`
    display: flex;
    height: 6vh;
    position: relative;

    .reply_text_length{
    position: absolute;
    bottom: 10px;
    right: 70px;
    font-size: 0.6em;
    color: #888;
    }
`;


export default function Tweet({memberName, tweet, boardId, memberId, replies ,onTweetPosted}:ITweet) {
    const [content, setContent] = useState("");
    const [changeTweet, setChangeTweet] = useState(tweet);
    const [replyList, setReplyList] = useState<IReply[]>(replies); 
    const [file, setFile] = useState<File|null>(null);
    const dispatch = useDispatch();
    const user = useSelector((state:any)=>state.user);
    const replySet = useSelector((state:any)=>state.replyEdit === boardId);
    const boardSet = useSelector((state:any)=>state.boardEdit === boardId);
    const isMyself = user === memberId

    const onDelete = async() => {
        const ok = confirm("Are you sure you want to delete this tweet?");
        if(!ok || false) return;
        try {
            const response = await axiosConfig.delete(`/api/board/${boardId}`);

            if(response.status == 200) {
                onTweetPosted();
            }
        } catch (e) {
            console.log(e);
        } finally {
            dispatch({type: "BOARD_EDIT", payload: null});
        }
    }

    const onEditSubmit =async() => {
        const ok = confirm("Are you sure you want to edit this tweet?");
        if(!ok || false) return;
        if(user === null) return
        const replaced = changeTweet.replace(/<(?!img\b|iframe\b)[^>]+>/gi, '') 
                        .replace(/&nbsp;/g, '') 
                        .trim();
        if(replaced === "") {
            alert("글을 입력해 주세요")
            return;
        };
        try{
            const formData = new FormData();
            formData.append("boardId", boardId.toString());
            formData.append("user", user);
            formData.append("tweet", changeTweet);
            if(file !== null){
                formData.append("file", file);
            }
            const response = await axiosConfig.put("/api/board",formData);

            if(response.status == 200) {
                onTweetPosted();
            }
            setFile(null);
        }catch(e) {
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("로그인이 필요합니다.");
            }
        }finally {
            setFile(null);
            dispatch({type: "BOARD_EDIT", payload: null});
        }
    }

    const onReplySubmit = async() => {
        if(content.trim() === ""){
            alert("글을 입력해 주세요");
            return;
        }
        if(content.length > 200) return;
        try{
            const formData = new FormData();
            formData.append("boardId", boardId.toString());
            formData.append("content", content);
            const response = await axiosConfig.post("/api/reply", formData);
            if(response.status === 200){
                dispatch({type: "REPLY_EDIT", payload: null});
                dispatch({type: "BOARD_EDIT", payload: null});
                setContent("");
                onTweetPosted();
            }
        }catch(e){
            if(e instanceof AxiosError){
                console.log(e);
            }
        }
    }

    const onEdit = () => {
        if(user !== memberId) return;
        dispatch({type: "BOARD_EDIT", payload: boardId});
        dispatch({type: "REPLY_EDIT", payload: null});
        setChangeTweet(tweet);
        setFile(null);
    }

    const onReply = () => {
        dispatch({type: "REPLY_EDIT", payload: boardId});
        dispatch({type: "BOARD_EDIT", payload: null});
    }

    const onContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    }

    useEffect(() => {
        setReplyList(replies);
    }, [replies]);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline','strike', 'blockquote'],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const cleanHtml = DOMPurify.sanitize(tweet, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "height", "width"],
        ALLOWED_URI_REGEXP: /^https?:\/\/(www\.youtube\.com|youtube\.com|player\.vimeo\.com)\//,
    });

    return (<Wrapper isMyself={isMyself}>
        <Column>
            <Username>{memberName}</Username>
            {boardSet ? <StyledQuill value={changeTweet} onChange={setChangeTweet} modules={modules} theme="snow"/>:
            <Payload dangerouslySetInnerHTML={{ __html: cleanHtml }}></Payload>}
            {isMyself ? <BasicButton onClick={onDelete}>Delete</BasicButton> : null}
            {isMyself ? boardSet ? <BasicButton className="cancelBtn" onClick={onEdit}>cancel</BasicButton> :<BasicButton onClick={onEdit}>Edit</BasicButton> : null}
            {isMyself ? boardSet ? <BasicButton className="editSubmitBtn" onClick={onEditSubmit}>Edit Tweet</BasicButton> : null : null}
            {user !== null ? <BasicButton className="reply_button" onClick={onReply}>reply</BasicButton>: null}
            
            {/* === 여기서 replyList 표시 === */}
            {replyList.length > 0 ? 
                <div style={{marginTop:"5px", borderTop:"1px solid gray"}}>
                    <h4 style={{marginTop:"5px"}}>Re:</h4>
                    {replyList.map(reply => <Reply key={reply.id} {...reply} onTweetPosted={onTweetPosted}/>)}
                </div>
            :null}
            {/* ========================= */}

            {user !== null && replySet ? 
                <ReplyDiv>
                    {replySet ? <TextArea className="reply_text_box" value={content} onChange={onContent} maxLength={200}></TextArea>: null}
                    {replySet ? <BasicButton className="reply_add_button" onClick={onReplySubmit}>add</BasicButton>: null}
                    <div>{replySet ? <p className="reply_text_length">{content.length}/200</p> : null}</div>
                </ReplyDiv>: null}
        </Column>
    </Wrapper>
    )
}