"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Bridge from "./Icons/Bridge";
import Logo from "./Icons/Logo";
import Modal from "./Modal";
import Carousel3D from "./Carousel3D";
import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";

interface GalleryProps {
  images: ImageProps[];
}

export default function Gallery({ images }: GalleryProps) {
  const searchParams = useSearchParams();
  const photoId = searchParams.get("photoId");
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

  const lastViewedPhotoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    // 마지막으로 본 사진 위치로 스크롤
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current?.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);

  const carouselImages = [
    "/images/공익 포스터.jpg",
    "/images/동화_표지.jpg",
    "/images/북커버.png",
    "/images/패키지.png",
    "/images/책자 썸네일.jpg",
  ];

  const carouselTitles = [
    "공익 포스터",
    "동화 표지",
    "북커버",
    "패키지",
    "책자",
  ];

  // 캐러셀 이미지 데이터 찾기
  const carouselImageData = carouselImages.map((src) => {
    return images.find((img) => img.src === src);
  }).filter((img): img is ImageProps => img !== undefined);

  return (
    <>
      {/* 3D 캐러셀 - 최상단 */}
      <div className="w-full">
        <Carousel3D 
          imageData={carouselImageData} 
          titles={carouselTitles}
        />
      </div>
      <main className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              setLastViewedPhoto(photoId);
            }}
          />
        )}
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          {/* 줄별로 그룹화하여 렌더링 */}
          {[1, 2, 3, 4].map((rowNum) => {
            const rowImages = images.filter((img) => img.row === rowNum);
            return (
              <div key={rowNum} className="contents">
                {rowImages.map(({ id, src, width, height, blurDataUrl }, idx) => (
                  <div
                    key={id}
                    className={idx === rowImages.length - 1 ? "break-after-column" : ""}
                  >
                    <Link
                      href={`/?photoId=${id}`}
                      ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
                      className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
                    >
                      <Image
                        alt="Portfolio work"
                        className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                        style={{ transform: "translate3d(0, 0, 0)" }}
                        placeholder={blurDataUrl ? "blur" : "empty"}
                        blurDataURL={blurDataUrl}
                        src={src}
                        width={width}
                        height={height}
                        sizes="(max-width: 640px) 100vw,
                          (max-width: 1280px) 50vw,
                          (max-width: 1536px) 33vw,
                          25vw"
                      />
                    </Link>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>
      <footer className="p-6 text-center text-white/80 sm:p-12">
        © 2025 김민지. All rights reserved.
      </footer>
    </>
  );
}


