"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Modal from "./Modal";
import Carousel3D from "./Carousel3D";
import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";

interface GalleryProps {
  images: ImageProps[];
  motionImages?: ImageProps[];
}

export default function Gallery({ images, motionImages = [] }: GalleryProps) {
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

  // 1번 모션: 모바일 디자인.jpg
  const mobileDesignImage = images.find(
    (img) => img.src === "/images/모바일 디자인.jpg"
  );

  // 3번 모션: 동화책 페이지 이미지들 (오른쪽에서 왼쪽으로 페이지 넘김)
  const storySrcs = [
    "/images/동화_표지.jpg",
    "/images/동화.jpg",
    "/images/동화1.jpg",
  ];
  const storyImages = storySrcs
    .map((src) => images.find((img) => img.src === src))
    .filter((img): img is ImageProps => img !== undefined);

  // (현재는 모든 이미지를 클릭 가능하게 사용)
  const nonClickableSrcSet = new Set<string>();
  const storySrcSet = new Set<string>(storySrcs);

  // 캐러셀에 전달할 모션 이미지 시퀀스:
  // 1번: 모바일 디자인 (세로 스크롤)
  // 2번: public/motion 폴더의 이미지들 (3D 캐러셀)
  // 3번: 동화책 페이지 넘김
  const carouselImageData: ImageProps[] = [];
  if (mobileDesignImage) carouselImageData.push(mobileDesignImage);

  if (motionImages.length > 0) {
    // 모션 2에서 시작 이미지를 책자 썸네일로 고정
    const thumbnail = motionImages.find((img) =>
      img.src.endsWith("/책자 썸네일.jpg")
    );
    const rest = motionImages.filter(
      (img) => !img.src.endsWith("/책자 썸네일.jpg")
    );

    if (thumbnail) {
      carouselImageData.push(thumbnail, ...rest);
    } else {
      carouselImageData.push(...motionImages);
    }
  }

  return (
    <>
      {/* 모션 캐러셀 - 최상단 (작업 이미지 모달 열렸을 때는 숨김) */}
      {!photoId && (
        <div className="w-full">
          <Carousel3D imageData={carouselImageData} thirdImages={storyImages} />
        </div>
      )}
      <main className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              setLastViewedPhoto(photoId);
            }}
          />
        )}
        {/* 같은 src 이미지를 전체 그리드에서 한 번만 보여주기 위한 Set */}
        {(() => {
          const renderedSrc = new Set<string>();

          return (
            <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
              {/* 줄별로 그룹화하여 렌더링 (모션용 이미지는 그대로 보여주되, 같은 src는 한 번만) */}
              {[1, 2, 3, 4].map((rowNum) => {
                const rowImages = images.filter((img) => img.row === rowNum);
                return (
                  <div key={rowNum} className="contents">
                    {rowImages.map(({ id, src, width, height, blurDataUrl }, idx) => {
                      if (renderedSrc.has(src)) {
                        return null; // 같은 이미지(src)는 한 번만 표시
                      }
                      renderedSrc.add(src);

                      const isNonClickable = nonClickableSrcSet.has(src);
                      if (isNonClickable) {
                        return null; // 모션 전용(저장 불가) 이미지는 작업물 그리드에서 숨김
                      }

                      const imageEl = (
                    <Image
                      alt="Portfolio work"
                      className={`transform rounded-lg brightness-90 transition will-change-auto ${
                        isNonClickable ? "" : "group-hover:brightness-110"
                      }`}
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
                      );

                      return (
                        <div
                          key={id}
                          className={idx === rowImages.length - 1 ? "break-after-column" : ""}
                        >
                          <Link
                            href={`/?photoId=${id}`}
                            ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
                            className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
                          >
                            {imageEl}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </main>
      <footer className="p-6 text-center text-black/80 sm:p-12">
        © 2025 김민지. All rights reserved.
      </footer>
    </>
  );
}


