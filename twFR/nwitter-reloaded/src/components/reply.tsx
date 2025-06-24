import styled from "styled-components";
import { ReplyList } from "./timeline";
import { useEffect, useState } from "react";
import axiosConfig from "../api/axios"
import { AxiosError } from "axios";

const Wrapper = styled.div`

`;
const Column = styled.div`
    display: flex;
    flex-direction: row;
    .right_del{
        margin: 2px 0 0 3px;
        cursor: pointer;
        border-bottom: 2px solid gray;
        border-radius: 10%;
        max-height: 15px;
    }
    p {
        margin: 2px 2px;
    }
`;

export default function Reply({ id, boardId , memberId, insertTime, updateTime, memberName, content, onTweetPosted }:ReplyList) {
    const [myContent, setMyContent] = useState(content);
    const user = window.sessionStorage.getItem("user");
    const userId = memberId.toString();

    const onDelete = async() => {
        const ok = confirm("Are you sure you want to delete?");
        if(!ok) return;
        try{
            const response = await axiosConfig.delete("/api/reply", {data:id});
            if(response.status === 200) {
                onTweetPosted();
            }
        }catch(e){
            if(e === AxiosError) {
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
                <p>└</p>{memberName} : {myContent}
                {user === userId ? <p onClick={onDelete} className="right_del">✖</p> : null}
            </Column>
        </Wrapper>
    )
}