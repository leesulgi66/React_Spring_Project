import styled from "styled-components";
import { ITweet } from "./timeline";
import { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 15px;

`;

const Column = styled.div`
    &.photoBox {
        margin-left: 10%;
    }
`;

const Photo = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 15px;
`;

const Username = styled.span`
    font-weight: 600;
    font-size: 15px;
`;

const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
    word-break: break-all; // 단어가 분리 되어도 줄 바꿈
    white-space: pre-wrap; // with를 넘어가면 줄바꿈
`;

const DeleteButton = styled.button`
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
`;

const FileChangeButton = styled.label`
    display: inline-block;
    margin: 3% 20%;
    text-align: center;
    width: 35%;
    padding: 2px 7px;
    border-radius: 5px;
    border: 1px solid white;
    text-transform: uppercase;
    font-size: 11px;
    cursor: pointer;
`;

const FileChangeInput = styled.input`
    display: none;
`;

const TextArea = styled.textarea`
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    &::placeholder {
        font-size: 16px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

export default function Tweet({memberName, photo, tweet, boardId, memberId, photoKey,onTweetPosted}:ITweet) {
    const [isLoading, setLoading] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [changeTweet, setChangeTweet] = useState(tweet);
    const [viewPhoto, setViewPhoto] = useState(photo);
    const [file, setFile] = useState<File|null>(null);
    const user = window.sessionStorage.getItem("user");
    const userId = memberId.toString();
    const onDelete = async() => {
        const ok = confirm("Are you sure you want to delete this tweet?");
        if(!ok || false) return;
        try {
            const response = await axios.delete(`http://localhost:8080/api/board/${boardId}`, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                },
                withCredentials : true,
            });

            if(response.status == 200) {
                setLoading(false);
                onTweetPosted();
            }
            setEdit(false);
        } catch (e) {
            console.log(e);
            setEdit(false);
        } finally {
            setEdit(false);
        }
    }
    const onChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
        setChangeTweet(e.target.value);
    }
    const onEditSubmit =async() => {
        const ok = confirm("Are you sure you want to edit this tweet?");
        if(!ok || false) return;
        try{
            setLoading(true);
            if(user === null) return
            const formData = new FormData();
            formData.append("boardId", boardId.toString());
            formData.append("user", user);
            formData.append("tweet", changeTweet);
            if(file !== null){
                formData.append("file", file);
            }
            const response = await axios.put("http://localhost:8080/api/board",formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                },
                withCredentials : true,
            });

            if(response.status == 200) {
                setLoading(false);
                onTweetPosted();
            }
            setFile(null);
        }catch(e) {
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("Please Log in");
            }
            setLoading(false);
        }finally {
            setLoading(false);
            setFile(null);
            setEdit(false);
        }
    }
    const onEdit = () => {
        if(user !== userId) return;
        setEdit(!isEdit);
        setChangeTweet(tweet);
        setFile(null);
    }
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!files || files.length === 0) return;
    
        if (files[0].size > 1 * 1024 * 1024) {
            alert("Image file size should be less than 1Mb");
            return;
        }
        setFile(files[0]);
    };
    useEffect(() => {
        if (!file) return;
        console.log("file useeffect")
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const filelocation = reader.result as string;
            setViewPhoto(filelocation);
        };
    }, [file]);

    return (<Wrapper>
        <Column>
            <Username>{memberName}</Username>
            {isEdit ? <TextArea required rows={2} maxLength={180} value={changeTweet} onChange={onChange}/>:
            <Payload>{tweet}</Payload>}
            {user === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null}
            {user === userId ? isEdit ? <DeleteButton className="cancelBtn" onClick={onEdit}>cancel</DeleteButton> :<DeleteButton onClick={onEdit}>Eidt</DeleteButton> : null}
            {user === userId ? isEdit ? <DeleteButton className="editSubmitBtn" onClick={onEditSubmit}>Edit Tweet</DeleteButton> : null : null}
        </Column>
        <Column className="photoBox">
            {viewPhoto === null ? null : <Photo src={viewPhoto} /> }
            {isEdit ? <FileChangeButton htmlFor={boardId.toString()}> edit </ FileChangeButton>: null}
            <FileChangeInput onChange={onFileChange} type="file" id={boardId.toString()} accept="image/*" />
        </Column>
    </Wrapper>
    )
}