"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const prevPhotoIdRef = useRef<string | null>(null);
  const [showCarousel, setShowCarousel] = useState(!photoId);

  // 프로필 이미지 찾기
  const profileImage = images.find(
    (img) => img.src === "/images/프로필.png"
  );
  const profileImageId = profileImage?.id;

  useEffect(() => {
    const currentPhotoId = photoId;
    const prevPhotoId = prevPhotoIdRef.current;
    
    // 모달이 닫혔을 때 저장된 스크롤 위치로 복원
    if (prevPhotoId && !currentPhotoId && typeof window !== "undefined") {
      // 캐러셀을 먼저 숨김
      setShowCarousel(false);
      
      // 프로필 모달인 경우
      const savedProfileScrollY = sessionStorage.getItem("profileModalScrollY");
      const savedProfileId = sessionStorage.getItem("profileModalId");
      if (savedProfileScrollY !== null && savedProfileId && profileImageId && 
          prevPhotoId === profileImageId.toString() && 
          savedProfileId === profileImageId.toString()) {
        // 즉시 스크롤 복원
        const scrollY = parseInt(savedProfileScrollY, 10);
        window.scrollTo({ top: scrollY, behavior: "auto" });
        sessionStorage.removeItem("profileModalScrollY");
        sessionStorage.removeItem("profileModalId");
        // 스크롤 복원 후 캐러셀 표시
        setTimeout(() => {
          setShowCarousel(true);
        }, 50);
        return; // 프로필 모달 복원 후 종료
      }
      
      // 일반 갤러리 모달인 경우
      const savedGalleryScrollY = sessionStorage.getItem("galleryModalScrollY");
      const savedGalleryId = sessionStorage.getItem("galleryModalId");
      if (savedGalleryScrollY !== null && savedGalleryId && 
          prevPhotoId === savedGalleryId) {
        // 즉시 스크롤 복원 (requestAnimationFrame 사용하여 정확한 복원)
        const scrollY = parseInt(savedGalleryScrollY, 10);
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: "auto" });
          // 추가로 한 번 더 확인하여 정확한 위치로 스크롤
          requestAnimationFrame(() => {
            window.scrollTo({ top: scrollY, behavior: "auto" });
          });
        });
        sessionStorage.removeItem("galleryModalScrollY");
        sessionStorage.removeItem("galleryModalId");
        setLastViewedPhoto(null); // lastViewedPhoto 초기화
        // 스크롤 복원 후 캐러셀 표시
        setTimeout(() => {
          setShowCarousel(true);
        }, 100);
        return; // 갤러리 모달 복원 후 종료
      }
      
      // 저장된 스크롤 위치가 없는 경우에도 캐러셀 표시
      setShowCarousel(true);
    } else if (!currentPhotoId && !prevPhotoId) {
      // 모달이 열리지 않은 상태에서는 캐러셀 표시
      setShowCarousel(true);
    } else if (currentPhotoId) {
      // 모달이 열린 상태에서는 캐러셀 숨김
      setShowCarousel(false);
    }
    
    // 마지막으로 본 사진 위치로 스크롤은 하지 않음 (저장된 스크롤 위치로 복원하므로)
    if (lastViewedPhoto && !currentPhotoId) {
      setLastViewedPhoto(null);
    }
    
    // 이전 photoId 업데이트
    prevPhotoIdRef.current = currentPhotoId;
  }, [photoId, lastViewedPhoto, setLastViewedPhoto, profileImageId]);

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
      {showCarousel && (
        <div className="w-full">
          <Carousel3D 
            imageData={carouselImageData} 
            thirdImages={storyImages}
            profileImageId={profileImage?.id}
          />
        </div>
      )}
      <main id="gallery" className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              // 프로필 이미지 모달이 닫힌 경우
              if (photoId && profileImageId && photoId === profileImageId.toString()) {
                // 스크롤 복원은 useEffect에서 처리
                // lastViewedPhoto를 설정하지 않아서 갤러리로 스크롤되지 않음
              } else {
                // 일반 갤러리 모달인 경우
                // 스크롤 복원은 useEffect에서 처리
                setLastViewedPhoto(photoId);
              }
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
                            onClick={() => {
                              // 이미지 클릭 시 현재 스크롤 위치 저장
                              if (typeof window !== "undefined") {
                                // 정확한 스크롤 위치 저장
                                const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                                sessionStorage.setItem("galleryModalScrollY", currentScrollY.toString());
                                sessionStorage.setItem("galleryModalId", id.toString());
                              }
                            }}
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



