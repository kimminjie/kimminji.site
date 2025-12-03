/* eslint-disable no-unused-vars */
export interface ImageProps {
  id: number;
  height: number;
  width: number;
  src: string; // 로컬 이미지 경로 (예: /images/photo1.jpg)
  blurDataUrl?: string;
  row?: number; // 줄 번호 (1, 2, 3, 4)
  // 하위 호환성을 위해 유지
  public_id?: string;
  format?: string;
}

export interface SharedModalProps {
  index: number;
  images?: ImageProps[];
  currentPhoto?: ImageProps;
  changePhotoId: (newVal: number) => void;
  closeModal: () => void;
  navigation: boolean;
  direction?: number;
}
