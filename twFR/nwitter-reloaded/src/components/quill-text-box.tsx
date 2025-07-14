import { useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from 'quill-image-resize-module-react';
import styled from "styled-components";
import axiosConfig from "../api/axios"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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

// Quill에 리사이즈 모듈을 등록합니다. 컴포넌트 외부에 위치시켜 한 번만 실행되도록 합니다.
Quill.register('modules/imageResize', ImageResize);

export default function ReactQuillTextBox({ tweetValue , tweetChange, onSendData }:{ tweetValue: string , tweetChange: React.Dispatch<React.SetStateAction<string>>, onSendData : (data: number[]) => void}) {
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);
    const quillRef = useRef<ReactQuill>(null);
    const user = useSelector((state:any) => state.user);
    const navigate = useNavigate();

    const onFocus = () => {
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

        const imageHandler = () => {
            if(!user) return;
            if (!quillRef.current) return;

            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
                if (!quillRef.current) return;

                const file = input.files?.[0];
                if (!file) return;

                // 용량 체크는 그대로 유지
                const MAX_SIZE = 10 * 1024 * 1024;
                if (file.size > MAX_SIZE) {
                    alert('이미지 파일은 10MB를 초과할 수 없습니다.');
                    return;
                }

                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);

                try {
                    // 1. 로딩 표시: 사용자 경험을 위해 업로드 중임을 알림
                    quill.insertText(range.index, '이미지 업로드 중...', 'italic', true);
                    quill.setSelection(range.index + '이미지 업로드 중...'.length, 0);

                    // 2. FormData 생성 및 파일 추가
                    const formData = new FormData();
                    formData.append('image', file); // 'image'는 서버와 약속된 키

                    // 3. API 호출 (axiosConfig 사용)
                    const response = await axiosConfig({
                        url: '/api/images/upload',
                        method: 'POST',
                        data: formData,
                        headers: {
                            'Content-Type': 'multipart/form-data', 
                        },
                    });

                    // 4. 성공 시, 서버에서 받은 이미지 URL을 에디터에 삽입
                    const {imageUrl, imageId} = response.data;
                    setUploadedImageIds(prevIds => {
                        const newIds = [...prevIds, imageId];
                        onSendData(newIds);
                        return newIds;
                    });

                    console.log(uploadedImageIds);
                    
                    // 5. 로딩 표시 삭제 및 이미지 삽입
                    quill.deleteText(range.index, '이미지 업로드 중...'.length); // 로딩 텍스트 삭제
                    quill.insertEmbed(range.index, 'image', imageUrl); // 서버 URL로 이미지 삽입
                    quill.setSelection(range.index + 1, 0);

                } catch (error) {
                    // 6. 실패 시, 로딩 표시 삭제 및 에러 메시지 출력
                    quill.deleteText(range.index, '이미지 업로드 중...'.length);
                    console.error('이미지 업로드 실패:', error);
                    alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
                }
            };
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
                    image: imageHandler, 
                },
            },
            clipboard: {
                matchers: [
                    ['img', (node: Element, delta: any) => {
                        // node의 타입을 HTMLImageElement로 간주하여 src에 안전하게 접근합니다.
                        const imageNode = node as HTMLImageElement;

                        // 1. src가 'data:'로 시작하는지 확인합니다.
                        //    이것이 바로 클립보드에서 직접 붙여넣은 이미지 데이터의 특징입니다.
                        if (imageNode.src && imageNode.src.startsWith('data:image/')) {
                            // 이 경우에만 붙여넣기를 차단합니다.
                            alert('이미지 붙여넣기는 지원되지 않습니다. 툴바의 이미지 버튼을 이용해주세요.');
                            return { ops: [] }; // 빈 Delta를 반환하여 작업을 취소합니다.
                        }

                        // 2. 그 외의 모든 <img> 태그(src가 http://, https:// 등인 경우)는
                        //    기존 콘텐츠이므로, 원래 Quill이 하려던 작업을 그대로 허용합니다.
                        //    원래의 delta를 그대로 반환하면 됩니다.
                        return delta;
                    }]
                ]
            },
            imageResize: {
                parchment: Quill.import('parchment'),
                modules: ['Resize', 'DisplaySize'],
                // ⭐️ 이 handleStyles 옵션을 추가합니다.
                handleStyles: {
                    backgroundColor: 'none',
                    border: 'none',
                    color: 'none'
                }
            },
        };
    }, []);

    return(
        <div>
            <StyledQuill className="quill_text_box" ref={quillRef} modules={modules} onFocus={onFocus} value={tweetValue} onChange={tweetChange} theme="snow"/>
        </div>
    )
}