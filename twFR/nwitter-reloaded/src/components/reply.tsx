import styled from "styled-components";
import { IReply } from "./timeline";
import { useEffect, useState } from "react";
import axiosConfig from "../api/axios"
import { AxiosError } from "axios";
import { useSelector } from "react-redux";

const Wrapper = styled.div`

`;
const Column = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start; /* 아이템들이 여러 줄로 나뉘어도 상단 정렬 유지 */
    gap: 8px; 
    p {
        margin: 2px 0;
    }
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0; /* 중요: 공간이 부족해도 이 컴포넌트의 크기는 줄어들지 않음 */
    white-space: nowrap; /* 중요: 이 컴포넌트 내부의 텍스트는 줄바꿈되지 않음 */

    /* UserInfo 내부의 p 태그들은 간격이 필요 없으므로 margin 제거 */
    p {
        margin: 0;
    }
    #comma{
        margin: 0 4px 0 2px; /* 콜론(:) 좌우 간격만 살짝 조정 */
    }
`;

//댓글 내용을 위한 컴포넌트 (긴 단어 처리를 위함)
const Content = styled.p`
    word-break: break-all; /* 매우 긴 영단어나 URL이 있어도 강제로 줄바꿈하여 레이아웃이 깨지지 않게 함 */
`;

const Username = styled.p<{isMyself:boolean}>`
    color:${props => props.isMyself ? '#ffffc1' : 'white'};
`;

const DeleteButton = styled.p`
    color: red;
    cursor: pointer;
    border-bottom: 1px solid;
    border-radius: 10%;
    max-height: 17px;
    flex-shrink: 0; /* 사용자 정보와 마찬가지로 크기가 줄어들지 않도록 설정 */
`;

export default function Reply({ id, memberId, boardMemberId, memberName, content, onTweetPosted }:IReply) {
    const [myContent, setMyContent] = useState(content);
    const user = useSelector((state:any)=>state.user);
    const isMyself = user === memberId;
    const writer = memberId === boardMemberId;

    const onDelete = async() => {
        const ok = confirm("Are you sure you want to delete?");
        if(!ok) return;
        try{
            const response = await axiosConfig.delete("/api/reply", {data:id});
            if(response.status === 200) {
                onTweetPosted();
            }
        }catch(e){
            if(e instanceof AxiosError){
                console.log(e);
            }
        }
    }

    useEffect(()=>{
        setMyContent(content);
    } ,[content]);
    return(
         <Wrapper>
            <Column>
                <UserInfo>
                    └{writer ? <p>🏠</p> : null}
                    <Username isMyself={isMyself}>{memberName}</Username>
                    <p id="comma">:</p>
                </UserInfo>
                
                <Content>{myContent}</Content> {/* 댓글 내용을 Content 컴포넌트로 렌더링 */}

                {isMyself ? <DeleteButton onClick={onDelete}> X </DeleteButton> : null}
            </Column>
        </Wrapper>
    )
}