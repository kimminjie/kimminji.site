import fs from "fs";
import path from "path";
import type { ImageProps } from "./types";

// 지원하는 이미지 포맷
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export default function getLocalImages(): ImageProps[] {
  // public/images 폴더 경로 (파일 존재 여부는 한 번만 확인)
  const imagesDirectory = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(imagesDirectory)) {
    return [];
  }

  // 사용자 지정 순서대로 줄 단위 이미지 배열 정의
  const row1Images = [
    "프로필.png",
    "경기대전 포스터.png",
    "공익 포스터.jpg",
    "북커버.png",
    "파프리카 카드뉴스.jpg",
  ];

  const row2Images = [
    "교보 e북.png",
    "e북.png",
    "동화_표지.jpg",
    "동화.jpg",
    "동화1.jpg",
  ];

  const row3Images = ["패키지.png", "패키지2.jpg", "책자.jpg"];

  const row4Images = ["모바일 디자인.jpg"];

  const rowGroups = [
    { row: 1, files: row1Images },
    { row: 2, files: row2Images },
    { row: 3, files: row3Images },
    { row: 4, files: row4Images },
  ];

  let globalIndex = 0;
  const images: ImageProps[] = [];
  const seenSrc = new Set<string>(); // 중복 src 방지용

  // 각 줄별로 이미지 생성하고 줄 정보 포함
  rowGroups.forEach(({ row, files }) => {
    files.forEach((file) => {
      // 프로필.png는 /프로필.png로, 나머지는 /images/ 경로 사용
      const src = file === "프로필.png" ? `/프로필.png` : `/images/${file}`;
      if (seenSrc.has(src)) return; // 이미 추가된 이미지면 건너뛰기

      images.push({
        id: globalIndex,
        src,
        width: 1920,
        height: 1280,
        row, // 줄 정보 추가
      });
      seenSrc.add(src);
      globalIndex++;
    });
  });

  return images;
}