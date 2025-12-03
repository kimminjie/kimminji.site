import Link from "next/link";
import Carousel3D from "../../components/Carousel3D";
import getLocalImages from "../../utils/getLocalImages";

export default function CarouselPage() {
  const allImages = getLocalImages();

  const carouselImageSrcs = [
    "/images/공익 포스터.jpg",
    "/images/동화_표지.jpg",
    "/images/북커버.png",
    "/images/패키지.png",
    "/images/책자 썸네일.jpg",
  ];

  // 캐러셀 이미지 데이터 찾기
  const carouselImageData = carouselImageSrcs.map((src) => {
    return allImages.find((img) => img.src === src);
  }).filter((img): img is NonNullable<typeof img> => img !== undefined);

  return (
    <>
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
      >
        ← 갤러리로 돌아가기
      </Link>
      <Carousel3D imageData={carouselImageData} />
    </>
  );
}

