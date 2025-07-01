import axios, { AxiosError } from "axios";
import axiosConfig from "../api/axios"
import React, { useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components"
import CsrfToken from "../api/csrfTokenGet";

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

// 모든 종류의 YouTube URL에서 비디오 ID를 추출하는 함수
const parseYoutubeUrl = (url: string): string | null => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default function PostTweetForm({ onTweetPosted }: { onTweetPosted: () => void }) {
    const [isLoading, setLoading] = useState(false);
    const [tweet, setTweet] = useState("");
    const user = useSelector((state:any) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const quillRef = useRef<ReactQuill>(null);

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

    const onClick = () => {
        if(user === null) {
            const ok = confirm("글쓰기를 하려면 로그인이 필요합니다. 로그인 하시겠습니까?");
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

            const response = await fetchWithRetry({
                url: "/api/board",
                method: 'POST',
                data: formData,
            }, 2, 500);

            if(response.status == 200) {
                setLoading(false);
                onTweetPosted();
            }
            setTweet("");
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

    const modules = useMemo(() => {
        // 커스텀 비디오 핸들러 함수
        const youtubeHandler = () => {
            // ref가 없으면 중단
            if (!quillRef.current) return;

            const url = prompt('유튜브 영상 URL을 입력해주세요. (Shorts 포함)');
            if (!url) return; // 사용자가 입력을 취소한 경우

            const videoId = parseYoutubeUrl(url);

            if (videoId) {
                // Quill 에디터 인스턴스를 가져옵니다.
                const quill = quillRef.current.getEditor();
                // 현재 커서 위치를 가져옵니다.
                const range = quill.getSelection(true);
                // 최종 삽입될 임베드 URL을 만듭니다.
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                
                // 현재 커서 위치에 비디오를 삽입합니다.
                quill.insertEmbed(range.index, 'video', embedUrl);
                quill.setSelection(range.index + 1, 0);
            } else {
                alert('올바른 유튜브 URL이 아닙니다.');
            }
        };

        return {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline','strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                    ['link', 'image', 'video'], // 'video' 버튼
                    ['clean']
                ],
                // handlers 객체에 'video' 키 값으로 우리가 만든 핸들러를 연결합니다.
                handlers: {
                    video: youtubeHandler,
                    //image: imageHandler, // 기존 이미지 핸들러가 있다면 그대로 유지
                }
            }
        };
    }, []);
    return (
    <Form onSubmit={onSubmit}>
        <div>
            <StyledQuill className="quill_text_box" ref={quillRef} value={tweet} onFocus={onClick} onChange={setTweet} modules={modules} theme="snow"/>
        </div>
        <SubmitBtn type="submit" value={isLoading ? "Posting..." : "Post Memo"}/>
    </Form>
    )
}