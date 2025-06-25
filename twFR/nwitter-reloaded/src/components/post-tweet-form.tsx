import axios, { AxiosError } from "axios";
import axiosConfig from "../api/axios"
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

export default function PostTweetForm({ onTweetPosted }: { onTweetPosted: () => void }) {
    const [isLoading, setLoading] = useState(false);
    const [tweet, setTweet] = useState("");
    const [user, setUser] = useState(window.sessionStorage.getItem("user"));
    const loginState = useSelector((state:any) => state.login);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onClick = () => {
        if(loginState === false) {
            const ok = confirm("You need to log in. Do you want to log in?");
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
            alert("글을 입력해 주세요")
            return};
        try{
            setLoading(true);
            if(user === null) {
                alert("로그인이 필요합니다.");
                return
            }
            const formData = new FormData();
            formData.append("user", user);
            formData.append("tweet", tweet);

            const response = await axiosConfig.post("/api/board",formData);

            if(response.status == 200) {
                setLoading(false);
                onTweetPosted();
            }
            setTweet("");
        }catch(e){  
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("로그인이 필요합니다.");
                dispatch({type: "SET_LOGIN", payload: false});
                navigate("/login");
            }
            if(e instanceof AxiosError && e.status === 500) {
                alert("이미지와 기타파일의 용량이 너무 큽니다.");
            }
            
        }finally {
            setLoading(false);
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