import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";
import { useState } from "react";

const Wrapper = styled.div`
    display: grid;
    gap: 50px;
    overflow-y: scroll;
    grid-template-rows: 1fr 9fr;
`;

export default function Home() {
    const [tweetsUpdated, setTweetsUpdated] = useState(false);

    const onTweetPosted = () => {
        setTweetsUpdated((prev) => !prev) // 상태를 토글하여 현재값에서 반대값으로
    };

    return (
        <Wrapper>
            <PostTweetForm onTweetPosted={onTweetPosted} />
            <Timeline tweetsUpdated={tweetsUpdated} onTweetPosted={onTweetPosted} />
        </Wrapper>
    );
}