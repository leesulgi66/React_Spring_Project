import styled from "styled-components"
import { useNavigate } from "react-router-dom";

const Button = styled.span`
    margin-top: 10px;
    background-color: #fde500;
    font-weight: 500;
    width: 100%;
    color: black;
    padding : 10px 20px;
    border-radius: 50px;
    border: 0;
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const Logo = styled.img`
    height: 25px;
`;

export default function KakaoButton() {
    const navigate = useNavigate();
    const onClick = async () => {
        try {
            window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <Button onClick={onClick}>
            <Logo src="/social-img-kakao.png" />
            Continue with Kakao
        </Button>
    );
}