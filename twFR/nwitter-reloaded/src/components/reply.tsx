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
    .right_del{
        margin: 2px 0 0 3px;
        cursor: pointer;
        border-bottom: 2px solid gray;
        border-radius: 10%;
        max-height: 15px;
    }
    p {
        margin: 2px 0;
    }
    #comma{
        margin: 0 2px;
    }
`;

const Username = styled.p<{isMyself:boolean}>`
    color:${props => props.isMyself ? '#ffffc1' : 'white'};
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
                └{writer ? <p>🏠</p>:null}<Username isMyself={isMyself}>{memberName}</Username><p id="comma">:</p><p>{myContent}</p>
                {isMyself ? <p onClick={onDelete} className="right_del">✖</p> : null}
            </Column>
        </Wrapper>
    )
}