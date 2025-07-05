// src/declarations.d.ts  <-- 이 파일 하나만 만듭니다.

// quill-image-resize-module-react 타입 선언
declare module 'quill-image-resize-module-react';

// store 모듈 타입 선언
declare module './store' {
  const store: any; // 실제 store의 타입에 맞게 수정하면 더 좋습니다.
  export default store;
}