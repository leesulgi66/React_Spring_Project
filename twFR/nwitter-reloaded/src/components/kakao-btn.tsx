import styled from "styled-components"

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
    const baseUrl = import.meta.env.VITE_SERVER_URL;
    const onClick = async () => {
        const popup = window.open(
                baseUrl+"/oauth2/authorization/kakao", 
                'oauth2Popup',
                'width=500,height=600'
            );

        const receiveMessage = (event:MessageEvent) => {
            if(event.origin !== baseUrl) {
                return;
            }
            if (event.data === "oauth-success") {
                window.location.href = "/";
                window.removeEventListener("message", receiveMessage);
                if (popup) popup.close();
            }
        };

        window.addEventListener("message", receiveMessage);

    };
    return (
        <Button onClick={onClick}>
            <Logo src="/social-img-kakao.png" />
            Continue with Kakao
        </Button>
    );
}