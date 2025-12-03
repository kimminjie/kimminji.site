import fs from "fs";
import path from "path";
import type { ImageProps } from "./types";

// 지원하는 이미지 포맷
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export default function getLocalImages(): ImageProps[] {
  const imagesDirectory = path.join(process.cwd(), "public", "images");

  // images 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(imagesDirectory)) {
    return [];
  }

  const files = fs.readdirSync(imagesDirectory);
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  // 이미지 순서를 줄 단위로 지정
  // 2번 줄 이미지들
  const row2Images = [
    "교보 e북.png",
    "e북.png",
    "동화_표지.jpg",
    "동화2.jpg",
    "동화1.jpg",
  ];
  // 3번 줄 이미지들
  const row3Images = [
    "패키지.png",
    "패키지2.jpg",
    "책자.jpg",
  ];
  // 4번 줄 이미지들
  const row4Images = [
    "모바일 디자인.jpg",
  ];

  // 지정된 이미지 목록 (2, 3, 4번 줄)
  const specifiedImages = [
    ...row2Images,
    ...row3Images,
    ...row4Images,
  ];

  // 1번 줄 이미지들 (나머지 모든 이미지들)
  const row1Images: string[] = [];
  const excludedFiles = ["포폴.png", "자소서.png", "책자 썸네일.jpg"]; // 갤러리에서 제외할 파일들
  const mainPortfolioFile = "프로필.png";

  for (const file of imageFiles) {
    if (!specifiedImages.includes(file) && !excludedFiles.includes(file)) {
      row1Images.push(file);
    }
  }
  row1Images.sort();

  // 프로필.png를 1번 줄 맨 앞에 추가
  if (imageFiles.includes(mainPortfolioFile) && !specifiedImages.includes(mainPortfolioFile)) {
    const existIdx = row1Images.indexOf(mainPortfolioFile);
    if (existIdx > -1) {
      row1Images.splice(existIdx, 1);
    }
    row1Images.unshift(mainPortfolioFile);
  }

  // 줄별로 그룹화된 이미지 배열 생성
  const rowGroups = [
    { row: 1, files: row1Images },
    { row: 2, files: row2Images },
    { row: 3, files: row3Images },
    { row: 4, files: row4Images },
  ];

  let globalIndex = 0;
  const images: ImageProps[] = [];

  // 각 줄별로 이미지 생성하고 줄 정보 포함
  rowGroups.forEach(({ row, files }) => {
    files.forEach((file) => {
      images.push({
        id: globalIndex,
        src: `/images/${file}`,
        width: 1920,
        height: 1280,
        row: row, // 줄 정보 추가
      });
      globalIndex++;
    });
  });

  return images;
}