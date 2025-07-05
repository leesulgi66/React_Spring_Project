import { AxiosError } from "axios";
import axiosConfig from "../api/axios"
import React, { useState } from "react";
import 'react-quill/dist/quill.snow.css'
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components"
import CsrfToken from "../api/csrfTokenGet";
import ReactQuillTextBox from "./quill-text-box";

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

export default function PostTweetForm({ onTweetPosted }: { onTweetPosted: () => void }) {
    const [isLoading, setLoading] = useState(false);
    const [tweet, setTweet] = useState("");
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);
    const user = useSelector((state:any) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchWithRetry = async (
        config: any, 
        retries: number = 2, 
        delay: number = 500
    ) => {
        try {
            const response = await axiosConfig(config);
            return response;
        } catch (error) {
            if (retries > 0) {
                CsrfToken().then(token => {
                    dispatch({type: "SET_STRING", payload : token});
                });
                await new Promise(res => setTimeout(res, delay));
                return fetchWithRetry(config, retries - 1, delay);
            } else {
                throw error;
            }
        }
    };

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
            uploadedImageIds.forEach(image => {formData.append("imageIds", image.toString())});

            const response = await fetchWithRetry({
                url: "/api/board",
                method: 'POST',
                data: formData,
            }, 2, 300);

            if(response.status == 200) {
                setLoading(false);
                onTweetPosted();
                setTweet("");
                setUploadedImageIds([]);
            }
        }catch(e){  
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("로그인이 필요합니다.");
                dispatch({type: "SET_USER", payload: null});
                navigate("/login");
            }
            if(e instanceof AxiosError && e.status === 500) {
                if(e?.response?.data === "Maximum upload size exceeded"){
                    alert("이미지와 기타파일의 용량이 너무 큽니다.");
                }
            }
            if(e instanceof AxiosError){
                if(e.message === "Network Error"){
                    alert("서버의 응답이 없습니다.");
                }
            }
            
        }finally {
            setLoading(false);
        }
    }

    const handleDataFromChild = (data:number[]) => {
        setUploadedImageIds(()=>data);
    }

    return (
    <Form onSubmit={onSubmit}>
        <div>
            <ReactQuillTextBox tweetValue={tweet}  tweetChange={setTweet} onSendData={handleDataFromChild}/>
        </div>
        <SubmitBtn type="submit" value={isLoading ? "Posting..." : "Post Memo"}/>
    </Form>
    )
}