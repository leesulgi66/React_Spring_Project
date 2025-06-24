import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components"

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 1px;
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

const AttachFileButton = styled.label`
    padding: 10px 0px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

const AttachFileInput = styled.input`
    display: none;
`;

const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover,
    &:active {
        opacity: 0.8;
    }
`;

const StyledQuill = styled(ReactQuill)`
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

export default function PostTweetForm({ onTweetPosted }: { onTweetPosted: () => void }) {
    const [isLoading, setLoading] = useState(false);
    const [tweet, setTweet] = useState("");
    const [file, setFile] = useState<File|null>(null);
    const [user, setUser] = useState(window.sessionStorage.getItem("user"));
    const loginState = useSelector((state:any) => state.login);
    const csrfToken = useSelector((state:any)=>state.csrfToken);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value);
    }
    const onClick = () => {
        if(loginState === false) {
            const ok = confirm("Please login.");
            if(!ok) {
                (document.activeElement as HTMLElement).blur() 
                navigate("/");
            }else {
                navigate("/login");
            }
        }
    }

    const onSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const replaced = tweet.replace(/<(?!img\b|iframe\b)[^>]+>/gi, '') // HTML 제거
                         .replace(/&nbsp;/g, '') // nbsp 제거
                         .trim();
        if(isLoading || replaced === "") {
            alert("Please input it")
            return};
        try{
            setLoading(true);
            if(user === null) {
                alert("Please login");
                return
            }
            const formData = new FormData();
            formData.append("user", user);
            formData.append("tweet", tweet);
            if(file !== null){
                formData.append("file", file);
            }else{
                formData.append("dummy", new Blob([""], { type: "text/plain" }), "dummy.txt");
            }
            const response = await axios.post("http://localhost:8080/api/board",formData, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                withCredentials : true,
            });

            if(response.status == 200) {
                setLoading(false);
                onTweetPosted();
            }
            setTweet("");
            setFile(null);
        }catch(e){  
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("Please Log in");
                dispatch({type: "SET_LOGIN", payload: false});
                navigate("/login");
            }
            
        }finally {
            setLoading(false);
            setFile(null);
        }
    }

    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline','strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                //image: imageHandler
            }
        }
    };
    return (
    <Form onSubmit={onSubmit}>
        <div>
            <StyledQuill className="quill_text_box" value={tweet} onFocus={onClick} onChange={setTweet} modules={modules} theme="snow"/>
        </div>
        <SubmitBtn type="submit" value={isLoading ? "Posting..." : "Post Tweet"}/>
    </Form>
    )
}