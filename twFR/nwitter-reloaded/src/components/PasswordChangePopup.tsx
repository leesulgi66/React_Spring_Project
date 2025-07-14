import React, { useState } from 'react';
import styled from 'styled-components';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background-color: #001543;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 450px;
  text-align: left;
`;

const Title = styled.h2`
  margin-top: 0;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

// primary prop에 따라 스타일이 바뀌는 버튼
const Button = styled.button<{ primary?: boolean }>`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background-color: ${props => (props.primary ? '#007bff' : '#f0f0f0')};
  color: ${props => (props.primary ? 'white' : '#333')};

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.875rem;
  margin: 0;
  text-align: center;
`;


// --- 컴포넌트 Props 타입 정의 ---

interface IPasswordChangePopupProps {
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}

// --- 컴포넌트 로직 ---

const PasswordChangePopup: React.FC<IPasswordChangePopupProps> = ({ onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    // 1. 유효성 검사: 빈 값 확인
    if (!password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 2. 유효성 검사: 비밀번호 일치 여부 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(password); // 부모의 onSubmit 함수에 새 비밀번호만 전달
    } catch (err) {
      setError('변경 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <PopupOverlay onClick={handleOverlayClick}>
      <PopupContent>
        <Title>비밀번호 변경</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="new-password">새 비밀번호</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonContainer>
            <Button type="button" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" primary disabled={isSubmitting}>
              {isSubmitting ? '변경 중...' : '변경하기'}
            </Button>
          </ButtonContainer>
        </Form>
      </PopupContent>
    </PopupOverlay>
  );
};

export default PasswordChangePopup;