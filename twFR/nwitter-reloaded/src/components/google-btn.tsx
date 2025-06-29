import styled from "styled-components"
import { useNavigate } from "react-router-dom";
import axiosConfig from "../api/axios"

const Button = styled.span`
    margin-top: 30px;
    background-color: #ffffff;
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

export default function GoogleButton() {
    const navigate = useNavigate();
    const onClick = async () => {
        // window.open(
        //         "http://localhost:8080/oauth2/authorization/google", 
        //         'oauth2Popup',
        //         'width=500,height=600'
        //     );
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };
    return (
        <Button onClick={onClick}>
            <Logo src="/social-img-google.png" />
            Continue with Google
        </Button>
    );
}