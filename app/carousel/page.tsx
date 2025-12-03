import Link from "next/link";
import Carousel3D from "../../components/Carousel3D";

export default function CarouselPage() {
  const images = [
    "/images/공익 포스터.jpg",
    "/images/동화_표지.jpg",
    "/images/북커버.png",
    "/images/패키지.png",
    "/images/책자 썸네일.jpg",
  ];

  const titles = [
    "공익 포스터",
    "동화 표지",
    "북커버",
    "패키지",
    "책자",
  ];

  return (
    <>
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
      >
        ← 갤러리로 돌아가기
      </Link>
      <Carousel3D images={images} titles={titles} />
    </>
  );
}

