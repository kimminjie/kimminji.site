import fs from "fs";
import path from "path";
import type { ImageProps } from "./types";

// 모션 전용 이미지 (3D 캐러셀 등)에 사용하는 로컬 이미지 로더
// public/motion 폴더 안에 넣은 모든 이미지를 불러옵니다.

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export default function getMotionImages(): ImageProps[] {
  const motionDir = path.join(process.cwd(), "public", "motion");

  if (!fs.existsSync(motionDir)) {
    return [];
  }

  const files = fs.readdirSync(motionDir);
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  let index = 0;
  const images: ImageProps[] = [];

  imageFiles.forEach((file) => {
    images.push({
      id: index++,
      src: `/motion/${file}`,
      // 대략적인 기본값 (3D 캐러셀에서 실제 비율에 맞게 object-contain으로 표시)
      width: 1920,
      height: 1080,
    });
  });

  return images;
}


