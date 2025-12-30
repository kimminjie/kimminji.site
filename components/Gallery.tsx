"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Carousel3D, { type CategoryId } from "./Carousel3D";
import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";
import { range } from "../utils/range";

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
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("ALL");
  const [showEditorialModal, setShowEditorialModal] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  // 모바일에서 카테고리 사이드바 토글 상태
  const [showEditorialSidebar, setShowEditorialSidebar] = useState(false);
  const [showPosterSidebar, setShowPosterSidebar] = useState(false);
  const [showDigitalSidebar, setShowDigitalSidebar] = useState(false);
  const [showBrandSidebar, setShowBrandSidebar] = useState(false);
  const [showAllSidebar, setShowAllSidebar] = useState(false);
  const [allModalIndex, setAllModalIndex] = useState(0);
  const [editorialModalIndex, setEditorialModalIndex] = useState(0);
  const [posterModalIndex, setPosterModalIndex] = useState(0);
  const [digitalModalIndex, setDigitalModalIndex] = useState(0);
  const [brandModalIndex, setBrandModalIndex] = useState(0);

  // 프로필 이미지 찾기
  const profileImage = images.find(
    (img) => img.src === "/프로필.png"
  );
  const profileImageId = profileImage?.id;

  useEffect(() => {
    const currentPhotoId = photoId;
    const prevPhotoId = prevPhotoIdRef.current;

    // 모달이 닫혔을 때 저장된 스크롤 위치로 복원
    if (prevPhotoId && !currentPhotoId && typeof window !== "undefined") {
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
        return; // 프로필 모달 복원 후 종료
      }

      // 일반 갤러리 모달인 경우
      const savedGalleryScrollY = sessionStorage.getItem("galleryModalScrollY");
      const savedGalleryId = sessionStorage.getItem("galleryModalId");
      const fromEditorialModal = sessionStorage.getItem("fromEditorialModal");
      const fromPosterModal = sessionStorage.getItem("fromPosterModal");
      const fromDigitalModal = sessionStorage.getItem("fromDigitalModal");
      const fromBrandModal = sessionStorage.getItem("fromBrandModal");

      if (savedGalleryScrollY !== null && savedGalleryId &&
        prevPhotoId === savedGalleryId) {
        // 편집 모달에서 왔다면 편집 모달 다시 열기
        if (fromEditorialModal === "true") {
          sessionStorage.removeItem("fromEditorialModal");
          sessionStorage.removeItem("galleryModalScrollY");
          sessionStorage.removeItem("galleryModalId");
          setLastViewedPhoto(null);
          // 편집 모달 다시 열기
          setTimeout(() => {
            setShowEditorialSidebar(false);
            setShowEditorialModal(true);
          }, 100);
          return;
        }

        // 포스터 모달에서 왔다면 포스터 모달 다시 열기
        if (fromPosterModal === "true") {
          sessionStorage.removeItem("fromPosterModal");
          sessionStorage.removeItem("galleryModalScrollY");
          sessionStorage.removeItem("galleryModalId");
          setLastViewedPhoto(null);
          // 포스터 모달 다시 열기
          setTimeout(() => {
            setShowPosterSidebar(false);
            setShowPosterModal(true);
          }, 100);
          return;
        }

        // 디지털 모달에서 왔다면 디지털 모달 다시 열기
        if (fromDigitalModal === "true") {
          sessionStorage.removeItem("fromDigitalModal");
          sessionStorage.removeItem("galleryModalScrollY");
          sessionStorage.removeItem("galleryModalId");
          setLastViewedPhoto(null);
          // 디지털 모달 다시 열기
          setTimeout(() => {
            setShowDigitalSidebar(false);
            setShowDigitalModal(true);
          }, 100);
          return;
        }

        // 브랜드 모달에서 왔다면 브랜드 모달 다시 열기
        if (fromBrandModal === "true") {
          sessionStorage.removeItem("fromBrandModal");
          sessionStorage.removeItem("galleryModalScrollY");
          sessionStorage.removeItem("galleryModalId");
          setLastViewedPhoto(null);
          // 브랜드 모달 다시 열기
          setTimeout(() => {
            setShowBrandSidebar(false);
            setShowBrandModal(true);
          }, 100);
          return;
        }

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
        return; // 갤러리 모달 복원 후 종료
      }
    }

    // 마지막으로 본 사진 위치로 스크롤은 하지 않음 (저장된 스크롤 위치로 복원하므로)
    if (lastViewedPhoto && !currentPhotoId) {
      setLastViewedPhoto(null);
    }

    // 이전 photoId 업데이트
    prevPhotoIdRef.current = currentPhotoId;
  }, [photoId, lastViewedPhoto, setLastViewedPhoto, profileImageId]);

  // 편집 모달 닫기 함수 (메뉴창 다시 열기)
  const closeEditorialModal = () => {
    setShowEditorialModal(false);
    setShowCategoryMenu(true);
    setShowEditorialSidebar(false);
  };

  // 포스터 모달 닫기 함수 (메뉴창 다시 열기)
  const closePosterModal = () => {
    setShowPosterModal(false);
    setShowCategoryMenu(true);
    setShowPosterSidebar(false);
  };

  // 디지털 모달 닫기 함수 (메뉴창 다시 열기)
  const closeDigitalModal = () => {
    setShowDigitalModal(false);
    setShowCategoryMenu(true);
    setShowDigitalSidebar(false);
  };

  // 브랜드 모달 닫기 함수 (메뉴창 다시 열기)
  const closeBrandModal = () => {
    setShowBrandModal(false);
    setShowCategoryMenu(true);
    setShowBrandSidebar(false);
  };

  // 전체 이미지 목록 (경기대전 포스터.png부터 시작, 프로필.png 제외)
  const allImagesForModal = (() => {
    // 프로필 이미지 제외
    const filteredImages = images.filter((img) => img.src !== "/프로필.png");
    const startImage = filteredImages.find((img) => img.src === "/images/경기대전 포스터.png");
    if (!startImage) return filteredImages;

    const startIndex = filteredImages.findIndex((img) => img.id === startImage.id);
    return [...filteredImages.slice(startIndex), ...filteredImages.slice(0, startIndex)];
  })();

  // 전체 모달 닫기 함수 (메뉴창 다시 열기)
  const closeAllModal = () => {
    setShowAllModal(false);
    setShowCategoryMenu(true);
    setShowAllSidebar(false);
  };

  // 홈으로 가기 함수 (모든 모달 닫고 캐러셀 화면으로)
  const goToHome = () => {
    setShowEditorialModal(false);
    setShowPosterModal(false);
    setShowDigitalModal(false);
    setShowBrandModal(false);
    setShowAllModal(false);
    setShowCategoryMenu(false);
    setShowCarousel(true);
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showEditorialModal) {
          closeEditorialModal();
        } else if (showPosterModal) {
          closePosterModal();
        } else if (showDigitalModal) {
          closeDigitalModal();
        } else if (showBrandModal) {
          closeBrandModal();
        } else if (showAllModal) {
          closeAllModal();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showEditorialModal, showPosterModal, showDigitalModal, showBrandModal, showAllModal]);

  // 전체 모달에서 화살표 키로 이미지 넘기기
  useEffect(() => {
    if (!showAllModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setAllModalIndex((prev) => (prev > 0 ? prev - 1 : allImagesForModal.length - 1));
      } else if (e.key === "ArrowRight") {
        setAllModalIndex((prev) => (prev < allImagesForModal.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAllModal, allImagesForModal.length]);

  // 카테고리 정의
  const CATEGORY_DEFS = [
    { id: "ALL" as const, label: "전체" },
    { id: "EDITORIAL" as const, label: "편집 · 출판 디자인" },
    { id: "POSTER" as const, label: "포스터 · 비주얼 그래픽" },
    { id: "DIGITAL" as const, label: "디지털 콘텐츠 디자인" },
    { id: "BRAND" as const, label: "브랜드 · 패키지 디자인" },
  ];

  // 이미지별 카테고리 매핑 (추후 사용자 정의)
  const imageCategoryMap: Record<
    string,
    (typeof CATEGORY_DEFS)[number]["id"]
  > = {
    // 예시)
    // "/images/북커버.png": "EDITORIAL",
    // "/images/공익 포스터.jpg": "POSTER",
    // "/images/모바일 디자인.jpg": "DIGITAL",
    // "/images/패키지.png": "BRAND",
  };

  // 갤러리 그리드는 항상 전체 이미지 표시 (카테고리 선택과 무관)
  const filteredImages = images;

  // 편집 · 출판 디자인 이미지들
  const editorialImageSrcs = [
    "/images/동화_표지.jpg",
    "/images/동화.jpg",
    "/images/동화1.jpg",
    "/images/책자.jpg",
    "/images/북커버.png",
  ];
  const editorialImages = editorialImageSrcs
    .map((src) => images.find((img) => img.src === src))
    .filter((img): img is ImageProps => img !== undefined);

  // 포스터 · 비주얼 그래픽 이미지들
  const posterImageSrcs = [
    "/images/경기대전 포스터.png",
    "/images/공익 포스터.jpg",
  ];
  const posterImages = posterImageSrcs
    .map((src) => images.find((img) => img.src === src))
    .filter((img): img is ImageProps => img !== undefined);

  // 디지털 콘텐츠 디자인 이미지들
  const digitalImageSrcs = [
    "/images/모바일 디자인.jpg",
    "/images/파프리카 카드뉴스.jpg",
  ];
  const digitalImages = digitalImageSrcs
    .map((src) => images.find((img) => img.src === src))
    .filter((img): img is ImageProps => img !== undefined);

  // 브랜드 · 패키지 디자인 이미지들
  const brandImageSrcs = [
    "/images/패키지.png",
    "/images/패키지2.jpg",
  ];
  const brandImages = brandImageSrcs
    .map((src) => images.find((img) => img.src === src))
    .filter((img): img is ImageProps => img !== undefined);

  // 전체 모달에서 화살표 키로 이미지 넘기기
  useEffect(() => {
    if (!showAllModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setAllModalIndex((prev) => (prev > 0 ? prev - 1 : allImagesForModal.length - 1));
      } else if (e.key === "ArrowRight") {
        setAllModalIndex((prev) => (prev < allImagesForModal.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAllModal, allImagesForModal.length]);

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
      {/* 모션 캐러셀 - 최상단 (모달이 열려도 계속 렌더링하여 모션 유지) */}
      <div className={`w-full ${photoId ? 'pointer-events-none' : ''}`} style={{ visibility: photoId ? 'hidden' : 'visible' }}>
        <Carousel3D
          imageData={carouselImageData}
          thirdImages={storyImages}
          profileImageId={profileImage?.id}
          onMenuClick={() => setShowCategoryMenu((v) => !v)}
          showCategoryMenu={showCategoryMenu}
          selectedCategory={selectedCategory}
          onCategorySelect={(id) => {
            setSelectedCategory(id);
            setShowCategoryMenu(false);

            if (id === "EDITORIAL") {
              setShowEditorialSidebar(false);
              setShowEditorialModal(true);
            } else if (id === "POSTER") {
              setShowPosterSidebar(false);
              setShowPosterModal(true);
            } else if (id === "DIGITAL") {
              setShowDigitalSidebar(false);
              setShowDigitalModal(true);
            } else if (id === "BRAND") {
              setShowBrandSidebar(false);
              setShowBrandModal(true);
            } else if (id === "ALL") {
              setShowAllSidebar(false);
              setAllModalIndex(0);
              setShowAllModal(true);
            }
          }}
        />
      </div>
      <main id="gallery" className="mx-auto max-w-[1960px] p-4 bg-[#FEFBF9]">
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
                const rowImages = filteredImages.filter((img) => img.row === rowNum);
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
                          alt={`김민지 포트폴리오 작업물 ${src.split('/').pop()?.replace(/\.[^/.]+$/, '') || ''}`}
                          className={`transform rounded-lg brightness-90 transition will-change-auto ${isNonClickable ? "" : "group-hover:brightness-110"
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
                          loading="lazy"
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

      {/* 편집 · 출판 디자인 모달 */}
      {showEditorialModal && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/90 sm:bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            // 배경 클릭 시에만 모달 닫기
            if (e.target === e.currentTarget) {
              closeEditorialModal();
            }
          }}
        >
          <div
            className="relative w-full h-full max-w-[90rem] min-h-full sm:min-h-0 sm:max-h-[90vh] p-0 sm:p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col sm:flex-row gap-0 sm:gap-4 md:gap-6 lg:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 햄버거 버튼 */}
            <button
              type="button"
              className="fixed sm:hidden top-4 left-4 z-50 text-white text-2xl hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center bg-black/40 rounded-full"
              onClick={() => setShowEditorialSidebar(!showEditorialSidebar)}
              aria-label="카테고리 메뉴 토글"
            >
              {showEditorialSidebar ? "×" : "≡"}
            </button>

            {/* 닫기 버튼 */}
            <button
              type="button"
              className="fixed sm:absolute top-4 right-4 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 text-white text-4xl sm:text-3xl md:text-4xl hover:opacity-70 active:opacity-50 transition-opacity font-light leading-none touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center bg-black/40 sm:bg-transparent rounded-full sm:rounded-none"
              onClick={goToHome}
              aria-label="모달 닫기"
            >
              ×
            </button>

            {/* 왼쪽: 카테고리 메뉴 (모바일에서는 햄버거로 토글, 태블릿 이상에서는 항상 표시) */}
            <aside
              className={`fixed sm:relative top-0 left-0 h-full sm:h-auto w-64 sm:w-64 md:w-80 bg-black/95 sm:bg-transparent z-40 sm:z-auto transform transition-transform duration-300 ease-in-out ${showEditorialSidebar ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 sm:flex-none -ml-0 sm:-ml-4 md:-ml-8 mt-0 sm:mt-12 md:mt-10 lg:mt-16 space-y-4 sm:space-y-4 md:space-y-6 mr-0 sm:mr-12 md:mr-20 pt-16 sm:pt-0 px-6 sm:px-0`}
            >
              <div className="mb-6 sm:mb-6">
                <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide text-[#E45438]">
                  Menu
                </h2>
              </div>
              <nav className="space-y-3 sm:space-y-2 md:space-y-3 lg:space-y-4" aria-label="카테고리 메뉴">
                {CATEGORY_DEFS.map((cat, idx) => {
                  const isActive = cat.id === "EDITORIAL";
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`w-full flex items-center gap-3 sm:gap-2 md:gap-3 text-left p-3 sm:p-2 md:p-3 rounded-lg transition-colors touch-manipulation min-h-[52px] sm:min-h-[44px] active:bg-white/15 ${isActive
                        ? "bg-white/20 text-white font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/10 active:opacity-80"
                        }`}
                      onClick={() => {
                        if (cat.id === "EDITORIAL") return;
                        setShowEditorialModal(false);
                        if (cat.id === "POSTER") {
                          setShowPosterSidebar(false);
                          setPosterModalIndex(0);
                          setShowPosterModal(true);
                        } else if (cat.id === "DIGITAL") {
                          setShowDigitalSidebar(false);
                          setDigitalModalIndex(0);
                          setShowDigitalModal(true);
                        } else if (cat.id === "BRAND") {
                          setShowBrandSidebar(false);
                          setBrandModalIndex(0);
                          setShowBrandModal(true);
                        } else if (cat.id === "ALL") {
                          setShowAllSidebar(false);
                          setAllModalIndex(0);
                          setShowAllModal(true);
                        }
                      }}
                      aria-label={`${cat.label} 카테고리로 이동`}
                    >
                      <span className="text-xs sm:text-[10px] md:text-xs tracking-wider text-white/60 flex-shrink-0 font-medium">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span className="text-sm sm:text-xs md:text-sm lg:text-base font-medium break-words sm:truncate leading-tight">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* 모바일에서 사이드바 열려있을 때 오버레이 */}
            {showEditorialSidebar && (
              <div
                className="fixed sm:hidden inset-0 bg-black/50 z-30"
                onClick={() => setShowEditorialSidebar(false)}
              />
            )}

            {/* 오른쪽: 이미지 뷰어 */}
            {editorialImages.length > 0 && (
              <main className="flex-1 w-full sm:w-auto flex flex-col items-start justify-start relative pb-2 sm:pb-16 min-h-0 h-full sm:h-auto">
                {/* 이전 이미지 버튼 */}
                <button
                  type="button"
                  onClick={() => setEditorialModalIndex((prev) => (prev > 0 ? prev - 1 : editorialImages.length - 1))}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                  aria-label="이전 이미지"
                >
                  <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* 현재 이미지 */}
                {(() => {
                  const currentImage = editorialImages[editorialModalIndex];
                  const imageFileName = currentImage.src.split("/").pop() || "";
                  const scrollableImages = ["모바일 디자인.jpg", "책자.jpg"];
                  const isScrollable = scrollableImages.includes(imageFileName);

                  return (
                    <div
                      className={`flex-1 flex w-full ${isScrollable
                        ? "items-start overflow-y-auto overflow-x-hidden"
                        : "items-start"
                        } justify-start sm:justify-center ${isScrollable
                          ? "max-h-[45vh] sm:max-h-[calc(90vh-120px)] py-1"
                          : "max-h-[45vh] sm:max-h-[calc(90vh-120px)]"
                        } px-2 sm:px-4 md:px-0`}
                    >
                      <Image
                        src={currentImage.src}
                        width={currentImage.width}
                        height={currentImage.height}
                        alt={`김민지 포트폴리오 - ${currentImage.src.split("/").pop()?.replace(/\.[^/.]+$/, "") || "편집 출판 디자인 작업물"}`}
                        className={`${isScrollable
                          ? "w-full h-auto min-h-full"
                          : "max-w-full max-h-full object-contain object-left-top"
                          } rounded-lg`}
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
                      />
                    </div>
                  );
                })()}

                {/* 다음 이미지 버튼 */}
                <button
                  type="button"
                  onClick={() => setEditorialModalIndex((prev) => (prev < editorialImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                  aria-label="다음 이미지"
                >
                  <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* 하단 썸네일 네비게이션 */}
                <div className="relative w-full z-30 overflow-hidden bg-gradient-to-b from-black/40 to-black/95 mt-2 sm:mt-4 pb-3 sm:pb-4">
                  <motion.div
                    initial={false}
                    className="mx-auto mt-4 mb-2 flex aspect-[3/2] h-16 sm:h-20 max-w-5xl"
                  >
                    <AnimatePresence initial={false}>
                      {editorialImages
                        .filter((img, idx) => {
                          return range(editorialModalIndex - 15, editorialModalIndex + 15).includes(idx);
                        })
                        .map(({ src, width, height, id }, idx) => {
                          const indexInEditorial = editorialImages.findIndex((img) => img.id === id);
                          return (
                            <motion.button
                              key={id}
                              initial={{
                                width: "0%",
                                x: `${Math.max((editorialModalIndex - 1) * -100, 15 * -100)}%`,
                              }}
                              animate={{
                                scale: indexInEditorial === editorialModalIndex ? 1.25 : 1,
                                width: "100%",
                                x: `${Math.max(editorialModalIndex * -100, 15 * -100)}%`,
                              }}
                              exit={{ width: "0%" }}
                              onClick={() => setEditorialModalIndex(indexInEditorial)}
                              className={`${indexInEditorial === editorialModalIndex
                                ? "z-20 rounded-md shadow shadow-black/50"
                                : "z-10"
                                } ${indexInEditorial === 0 ? "rounded-l-md" : ""
                                } ${indexInEditorial === editorialImages.length - 1 ? "rounded-r-md" : ""
                                } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                            >
                              <Image
                                alt="thumbnail"
                                width={180}
                                height={120}
                                className={`${indexInEditorial === editorialModalIndex
                                  ? "brightness-110 hover:brightness-110"
                                  : "brightness-75 contrast-125 hover:brightness-90"
                                  } h-full transform object-cover transition`}
                                src={src}
                              />
                            </motion.button>
                          );
                        })}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </main>
            )}
          </div>
        </div>
      )}

      {/* 포스터 · 비주얼 그래픽 모달 */}
      {showPosterModal && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/90 sm:bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            // 배경 클릭 시에만 모달 닫기
            if (e.target === e.currentTarget) {
              closePosterModal();
            }
          }}
        >
          <div
            className="relative w-full h-full max-w-[90rem] min-h-full sm:min-h-0 sm:max-h-[90vh] p-0 sm:p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col sm:flex-row gap-0 sm:gap-4 md:gap-6 lg:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 햄버거 버튼 */}
            <button
              type="button"
              className="fixed sm:hidden top-4 left-4 z-50 text-white text-2xl hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center bg-black/40 rounded-full"
              onClick={() => setShowPosterSidebar(!showPosterSidebar)}
              aria-label="카테고리 메뉴 토글"
            >
              {showPosterSidebar ? "×" : "≡"}
            </button>

            {/* 닫기 버튼 */}
            <button
              type="button"
              className="fixed sm:absolute top-4 right-4 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 text-white text-4xl sm:text-3xl md:text-4xl hover:opacity-70 active:opacity-50 transition-opacity font-light leading-none touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center bg-black/40 sm:bg-transparent rounded-full sm:rounded-none"
              onClick={goToHome}
              aria-label="모달 닫기"
            >
              ×
            </button>

            {/* 왼쪽: 카테고리 메뉴 (모바일에서는 햄버거로 토글, 태블릿 이상에서는 항상 표시) */}
            <aside
              className={`fixed sm:relative top-0 left-0 h-full sm:h-auto w-64 sm:w-64 md:w-80 bg-black/95 sm:bg-transparent z-40 sm:z-auto transform transition-transform duration-300 ease-in-out ${showPosterSidebar ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 sm:flex-none -ml-0 sm:-ml-4 md:-ml-8 mt-0 sm:mt-12 md:mt-10 lg:mt-16 space-y-4 sm:space-y-4 md:space-y-6 mr-0 sm:mr-12 md:mr-20 pt-16 sm:pt-0 px-6 sm:px-0`}
            >
              <div className="mb-6 sm:mb-6">
                <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide text-[#E45438]">
                  Menu
                </h2>
              </div>
              <nav className="space-y-3 sm:space-y-2 md:space-y-3 lg:space-y-4" aria-label="카테고리 메뉴">
                {CATEGORY_DEFS.map((cat, idx) => {
                  const isActive = cat.id === "POSTER";
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`w-full flex items-center gap-3 sm:gap-2 md:gap-3 text-left p-3 sm:p-2 md:p-3 rounded-lg transition-colors touch-manipulation min-h-[52px] sm:min-h-[44px] active:bg-white/15 ${isActive
                        ? "bg-white/20 text-white font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/10 active:opacity-80"
                        }`}
                      onClick={() => {
                        if (cat.id === "POSTER") return;
                        setShowPosterModal(false);
                        if (cat.id === "EDITORIAL") {
                          setShowEditorialSidebar(false);
                          setShowEditorialModal(true);
                        } else if (cat.id === "DIGITAL") {
                          setShowDigitalSidebar(false);
                          setShowDigitalModal(true);
                        } else if (cat.id === "BRAND") {
                          setShowBrandSidebar(false);
                          setShowBrandModal(true);
                        } else if (cat.id === "ALL") {
                          setShowAllSidebar(false);
                          setAllModalIndex(0);
                          setShowAllModal(true);
                        }
                      }}
                      aria-label={`${cat.label} 카테고리로 이동`}
                    >
                      <span className="text-xs sm:text-[10px] md:text-xs tracking-wider text-white/60 flex-shrink-0 font-medium">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span className="text-sm sm:text-xs md:text-sm lg:text-base font-medium break-words sm:truncate leading-tight">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* 모바일에서 사이드바 열려있을 때 오버레이 */}
            {showPosterSidebar && (
              <div
                className="fixed sm:hidden inset-0 bg-black/50 z-30"
                onClick={() => setShowPosterSidebar(false)}
              />
            )}

            {/* 오른쪽: 이미지 뷰어 */}
            {posterImages.length > 0 && (
              <main className="flex-1 w-full sm:w-auto flex flex-col items-start justify-start relative pb-2 sm:pb-16 min-h-0 h-full sm:h-auto">
                {/* 이전 이미지 버튼 */}
                <button
                  type="button"
                  onClick={() => setPosterModalIndex((prev) => (prev > 0 ? prev - 1 : posterImages.length - 1))}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                  aria-label="이전 이미지"
                >
                  <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* 현재 이미지 */}
                {(() => {
                  const currentImage = posterImages[posterModalIndex];
                  const imageFileName = currentImage.src.split("/").pop() || "";
                  const scrollableImages = ["모바일 디자인.jpg", "책자.jpg"];
                  const isScrollable = scrollableImages.includes(imageFileName);

                  return (
                    <div
                      className={`flex-1 flex w-full ${isScrollable
                        ? "items-start overflow-y-auto overflow-x-hidden"
                        : "items-start"
                        } justify-start sm:justify-center ${isScrollable
                          ? "max-h-[45vh] sm:max-h-[calc(90vh-120px)] py-1"
                          : "max-h-[45vh] sm:max-h-[calc(90vh-120px)]"
                        } px-2 sm:px-4 md:px-0`}
                    >
                      <Image
                        src={currentImage.src}
                        width={currentImage.width}
                        height={currentImage.height}
                        alt={`김민지 포트폴리오 - ${currentImage.src.split("/").pop()?.replace(/\.[^/.]+$/, "") || "포스터 비주얼 그래픽 작업물"}`}
                        className={`${isScrollable
                          ? "w-full h-auto min-h-full"
                          : "max-w-full max-h-full object-contain object-left-top"
                          } rounded-lg`}
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
                      />
                    </div>
                  );
                })()}

                {/* 다음 이미지 버튼 */}
                <button
                  type="button"
                  onClick={() => setPosterModalIndex((prev) => (prev < posterImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                  aria-label="다음 이미지"
                >
                  <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* 하단 썸네일 네비게이션 */}
                <div className="relative w-full z-30 overflow-hidden bg-gradient-to-b from-black/40 to-black/95 mt-2 sm:mt-4 pb-3 sm:pb-4">
                  <motion.div
                    initial={false}
                    className="mx-auto mt-4 mb-2 flex aspect-[3/2] h-16 sm:h-20 max-w-5xl"
                  >
                    <AnimatePresence initial={false}>
                      {posterImages
                        .filter((img, idx) => {
                          return range(posterModalIndex - 15, posterModalIndex + 15).includes(idx);
                        })
                        .map(({ src, width, height, id }, idx) => {
                          const indexInPoster = posterImages.findIndex((img) => img.id === id);
                          return (
                            <motion.button
                              key={id}
                              initial={{
                                width: "0%",
                                x: `${Math.max((posterModalIndex - 1) * -100, 15 * -100)}%`,
                              }}
                              animate={{
                                scale: indexInPoster === posterModalIndex ? 1.25 : 1,
                                width: "100%",
                                x: `${Math.max(posterModalIndex * -100, 15 * -100)}%`,
                              }}
                              exit={{ width: "0%" }}
                              onClick={() => setPosterModalIndex(indexInPoster)}
                              className={`${indexInPoster === posterModalIndex
                                ? "z-20 rounded-md shadow shadow-black/50"
                                : "z-10"
                                } ${indexInPoster === 0 ? "rounded-l-md" : ""
                                } ${indexInPoster === posterImages.length - 1 ? "rounded-r-md" : ""
                                } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                            >
                              <Image
                                alt="thumbnail"
                                width={180}
                                height={120}
                                className={`${indexInPoster === posterModalIndex
                                  ? "brightness-110 hover:brightness-110"
                                  : "brightness-75 contrast-125 hover:brightness-90"
                                  } h-full transform object-cover transition`}
                                src={src}
                              />
                            </motion.button>
                          );
                        })}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </main>
            )}
          </div>
        </div>
      )}

      {/* 디지털 콘텐츠 디자인 모달 */}
      {showDigitalModal && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/90 sm:bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            // 배경 클릭 시에만 모달 닫기
            if (e.target === e.currentTarget) {
              closeDigitalModal();
            }
          }}
        >
          <div
            className="relative w-full h-full max-w-[90rem] min-h-full sm:min-h-0 sm:max-h-[90vh] p-0 sm:p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col sm:flex-row gap-0 sm:gap-4 md:gap-6 lg:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 햄버거 버튼 */}
            <button
              type="button"
              className="fixed sm:hidden top-4 left-4 z-50 text-white text-2xl hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center bg-black/40 rounded-full"
              onClick={() => setShowDigitalSidebar(!showDigitalSidebar)}
              aria-label="카테고리 메뉴 토글"
            >
              {showDigitalSidebar ? "×" : "≡"}
            </button>

            {/* 닫기 버튼 */}
            <button
              type="button"
              className="fixed sm:absolute top-4 right-4 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 text-white text-4xl sm:text-3xl md:text-4xl hover:opacity-70 active:opacity-50 transition-opacity font-light leading-none touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center bg-black/40 sm:bg-transparent rounded-full sm:rounded-none"
              onClick={goToHome}
              aria-label="모달 닫기"
            >
              ×
            </button>

            {/* 왼쪽: 카테고리 메뉴 (모바일에서는 햄버거로 토글, 태블릿 이상에서는 항상 표시) */}
            <aside
              className={`fixed sm:relative top-0 left-0 h-full sm:h-auto w-64 sm:w-64 md:w-80 bg-black/95 sm:bg-transparent z-40 sm:z-auto transform transition-transform duration-300 ease-in-out ${showDigitalSidebar ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 sm:flex-none -ml-0 sm:-ml-4 md:-ml-8 mt-0 sm:mt-12 md:mt-10 lg:mt-16 space-y-4 sm:space-y-4 md:space-y-6 mr-0 sm:mr-12 md:mr-20 pt-16 sm:pt-0 px-6 sm:px-0`}
            >
              <div className="mb-6 sm:mb-6">
                <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide text-[#E45438]">
                  Menu
                </h2>
              </div>
              <nav className="space-y-3 sm:space-y-2 md:space-y-3 lg:space-y-4" aria-label="카테고리 메뉴">
                {CATEGORY_DEFS.map((cat, idx) => {
                  const isActive = cat.id === "DIGITAL";
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`w-full flex items-center gap-3 sm:gap-2 md:gap-3 text-left p-3 sm:p-2 md:p-3 rounded-lg transition-colors touch-manipulation min-h-[52px] sm:min-h-[44px] active:bg-white/15 ${isActive
                        ? "bg-white/20 text-white font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/10 active:opacity-80"
                        }`}
                      onClick={() => {
                        if (cat.id === "DIGITAL") return;
                        setShowDigitalModal(false);
                        if (cat.id === "EDITORIAL") {
                          setShowEditorialSidebar(false);
                          setEditorialModalIndex(0);
                          setShowEditorialModal(true);
                        } else if (cat.id === "POSTER") {
                          setShowPosterSidebar(false);
                          setPosterModalIndex(0);
                          setShowPosterModal(true);
                        } else if (cat.id === "BRAND") {
                          setShowBrandSidebar(false);
                          setBrandModalIndex(0);
                          setShowBrandModal(true);
                        } else if (cat.id === "ALL") {
                          setShowAllSidebar(false);
                          setAllModalIndex(0);
                          setShowAllModal(true);
                        }
                      }}
                    >
                      <span className="text-[10px] sm:text-xs tracking-wider text-white/60 flex-shrink-0">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span className="text-xs sm:text-sm md:text-base font-medium truncate">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* 모바일에서 사이드바 열려있을 때 오버레이 */}
            {showDigitalSidebar && (
              <div
                className="fixed sm:hidden inset-0 bg-black/50 z-30"
                onClick={() => setShowDigitalSidebar(false)}
              />
            )}

            {/* 오른쪽: 이미지 뷰어 */}
            {digitalImages.length > 0 && (
              <main className="flex-1 w-full sm:w-auto flex flex-col items-start justify-start relative pb-2 sm:pb-16 min-h-0 h-full sm:h-auto">
                {/* 이전 이미지 버튼 */}
                <button
                  type="button"
                  onClick={() => setDigitalModalIndex((prev) => (prev > 0 ? prev - 1 : digitalImages.length - 1))}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                  aria-label="이전 이미지"
                >
                  <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* 현재 이미지 */}
                {(() => {
                  const currentImage = digitalImages[digitalModalIndex];
                  const imageFileName = currentImage.src.split("/").pop() || "";
                  const scrollableImages = ["모바일 디자인.jpg", "책자.jpg"];
                  const isScrollable = scrollableImages.includes(imageFileName);

                  return (
                    <div
                      className={`flex-1 flex w-full ${isScrollable
                        ? "items-start overflow-y-auto overflow-x-hidden"
                        : "items-start"
                        } justify-start sm:justify-center ${isScrollable
                          ? "max-h-[45vh] sm:max-h-[calc(90vh-120px)] py-1"
                          : "max-h-[45vh] sm:max-h-[calc(90vh-120px)]"
                        } px-2 sm:px-4 md:px-0`}
                    >
                      <Image
                        src={currentImage.src}
                        width={currentImage.width}
                        height={currentImage.height}
                        alt={`김민지 포트폴리오 - ${currentImage.src.split("/").pop()?.replace(/\.[^/.]+$/, "") || "디지털 콘텐츠 디자인 작업물"}`}
                        className={`${isScrollable
                          ? "w-full h-auto min-h-full"
                          : "max-w-full max-h-full object-contain object-left-top"
                          } rounded-lg`}
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
                      />
                    </div>
                  );
                })()}

                {/* 다음 이미지 버튼 */}
                <button
                  type="button"
                  onClick={() => setDigitalModalIndex((prev) => (prev < digitalImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                  aria-label="다음 이미지"
                >
                  <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* 하단 썸네일 네비게이션 */}
                <div className="relative w-full z-30 overflow-hidden bg-gradient-to-b from-black/40 to-black/95 mt-2 sm:mt-4 pb-3 sm:pb-4">
                  <motion.div
                    initial={false}
                    className="mx-auto mt-4 mb-2 flex aspect-[3/2] h-16 sm:h-20 max-w-5xl"
                  >
                    <AnimatePresence initial={false}>
                      {digitalImages
                        .filter((img, idx) => {
                          return range(digitalModalIndex - 15, digitalModalIndex + 15).includes(idx);
                        })
                        .map(({ src, width, height, id }, idx) => {
                          const indexInDigital = digitalImages.findIndex((img) => img.id === id);
                          return (
                            <motion.button
                              key={id}
                              initial={{
                                width: "0%",
                                x: `${Math.max((digitalModalIndex - 1) * -100, 15 * -100)}%`,
                              }}
                              animate={{
                                scale: indexInDigital === digitalModalIndex ? 1.25 : 1,
                                width: "100%",
                                x: `${Math.max(digitalModalIndex * -100, 15 * -100)}%`,
                              }}
                              exit={{ width: "0%" }}
                              onClick={() => setDigitalModalIndex(indexInDigital)}
                              className={`${indexInDigital === digitalModalIndex
                                ? "z-20 rounded-md shadow shadow-black/50"
                                : "z-10"
                                } ${indexInDigital === 0 ? "rounded-l-md" : ""
                                } ${indexInDigital === digitalImages.length - 1 ? "rounded-r-md" : ""
                                } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                            >
                              <Image
                                alt="thumbnail"
                                width={180}
                                height={120}
                                className={`${indexInDigital === digitalModalIndex
                                  ? "brightness-110 hover:brightness-110"
                                  : "brightness-75 contrast-125 hover:brightness-90"
                                  } h-full transform object-cover transition`}
                                src={src}
                              />
                            </motion.button>
                          );
                        })}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </main>
            )}
          </div>
        </div>
      )}

      {/* 브랜드 · 패키지 디자인 모달 */}
      {showBrandModal && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/90 sm:bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            // 배경 클릭 시에만 모달 닫기
            if (e.target === e.currentTarget) {
              closeBrandModal();
            }
          }}
        >
          <div
            className="relative w-full h-full max-w-[90rem] min-h-full sm:min-h-0 sm:max-h-[90vh] p-0 sm:p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col sm:flex-row gap-0 sm:gap-4 md:gap-6 lg:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 햄버거 버튼 */}
            <button
              type="button"
              className="fixed sm:hidden top-4 left-4 z-50 text-white text-2xl hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center bg-black/40 rounded-full"
              onClick={() => setShowBrandSidebar(!showBrandSidebar)}
              aria-label="카테고리 메뉴 토글"
            >
              {showBrandSidebar ? "×" : "≡"}
            </button>

            {/* 닫기 버튼 */}
            <button
              type="button"
              className="fixed sm:absolute top-4 right-4 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 text-white text-4xl sm:text-3xl md:text-4xl hover:opacity-70 active:opacity-50 transition-opacity font-light leading-none touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center bg-black/40 sm:bg-transparent rounded-full sm:rounded-none"
              onClick={goToHome}
              aria-label="모달 닫기"
            >
              ×
            </button>

            {/* 왼쪽: 카테고리 메뉴 (모바일에서는 햄버거로 토글, 태블릿 이상에서는 항상 표시) */}
            <aside
              className={`fixed sm:relative top-0 left-0 h-full sm:h-auto w-64 sm:w-64 md:w-80 bg-black/95 sm:bg-transparent z-40 sm:z-auto transform transition-transform duration-300 ease-in-out ${showBrandSidebar ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 sm:flex-none -ml-0 sm:-ml-4 md:-ml-8 mt-0 sm:mt-12 md:mt-10 lg:mt-16 space-y-4 sm:space-y-4 md:space-y-6 mr-0 sm:mr-12 md:mr-20 pt-16 sm:pt-0 px-6 sm:px-0`}
            >
              <div className="mb-6 sm:mb-6">
                <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide text-[#E45438]">
                  Menu
                </h2>
              </div>
              <nav className="space-y-3 sm:space-y-2 md:space-y-3 lg:space-y-4" aria-label="카테고리 메뉴">
                {CATEGORY_DEFS.map((cat, idx) => {
                  const isActive = cat.id === "BRAND";
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`w-full flex items-center gap-3 sm:gap-2 md:gap-3 text-left p-3 sm:p-2 md:p-3 rounded-lg transition-colors touch-manipulation min-h-[52px] sm:min-h-[44px] active:bg-white/15 ${isActive
                        ? "bg-white/20 text-white font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/10 active:opacity-80"
                        }`}
                      onClick={() => {
                        if (cat.id === "BRAND") return;
                        setShowBrandModal(false);
                        if (cat.id === "EDITORIAL") {
                          setShowEditorialSidebar(false);
                          setShowEditorialModal(true);
                        } else if (cat.id === "POSTER") {
                          setShowPosterSidebar(false);
                          setShowPosterModal(true);
                        } else if (cat.id === "DIGITAL") {
                          setShowDigitalSidebar(false);
                          setShowDigitalModal(true);
                        } else if (cat.id === "ALL") {
                          setShowAllSidebar(false);
                          setAllModalIndex(0);
                          setShowAllModal(true);
                        }
                      }}
                    >
                      <span className="text-[10px] sm:text-xs tracking-wider text-white/60 flex-shrink-0">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span className="text-xs sm:text-sm md:text-base font-medium truncate">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* 모바일에서 사이드바 열려있을 때 오버레이 */}
            {showBrandSidebar && (
              <div
                className="fixed sm:hidden inset-0 bg-black/50 z-30"
                onClick={() => setShowBrandSidebar(false)}
              />
            )}

            {/* 오른쪽: 이미지 뷰어 */}
            {brandImages.length > 0 && (
              <main className="flex-1 w-full sm:w-auto flex flex-col items-start justify-start relative pb-2 sm:pb-16 min-h-0 h-full sm:h-auto">
                {/* 이전 이미지 버튼 */}
                <button
                  type="button"
                  onClick={() => setBrandModalIndex((prev) => (prev > 0 ? prev - 1 : brandImages.length - 1))}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                  aria-label="이전 이미지"
                >
                  <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* 현재 이미지 */}
                {(() => {
                  const currentImage = brandImages[brandModalIndex];
                  const imageFileName = currentImage.src.split("/").pop() || "";
                  const scrollableImages = ["모바일 디자인.jpg", "책자.jpg"];
                  const isScrollable = scrollableImages.includes(imageFileName);

                  return (
                    <div
                      className={`flex-1 flex w-full ${isScrollable
                        ? "items-start overflow-y-auto overflow-x-hidden"
                        : "items-start"
                        } justify-start sm:justify-center ${isScrollable
                          ? "max-h-[45vh] sm:max-h-[calc(90vh-120px)] py-1"
                          : "max-h-[45vh] sm:max-h-[calc(90vh-120px)]"
                        } px-2 sm:px-4 md:px-0`}
                    >
                      <Image
                        src={currentImage.src}
                        width={currentImage.width}
                        height={currentImage.height}
                        alt={`김민지 포트폴리오 - ${currentImage.src.split("/").pop()?.replace(/\.[^/.]+$/, "") || "브랜드 패키지 디자인 작업물"}`}
                        className={`${isScrollable
                          ? "w-full h-auto min-h-full"
                          : "max-w-full max-h-full object-contain object-left-top"
                          } rounded-lg`}
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
                      />
                    </div>
                  );
                })()}

                {/* 다음 이미지 버튼 */}
                <button
                  type="button"
                  onClick={() => setBrandModalIndex((prev) => (prev < brandImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                  aria-label="다음 이미지"
                >
                  <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* 하단 썸네일 네비게이션 */}
                <div className="relative w-full z-30 overflow-hidden bg-gradient-to-b from-black/40 to-black/95 mt-2 sm:mt-4 pb-3 sm:pb-4">
                  <motion.div
                    initial={false}
                    className="mx-auto mt-4 mb-2 flex aspect-[3/2] h-16 sm:h-20 max-w-5xl"
                  >
                    <AnimatePresence initial={false}>
                      {brandImages
                        .filter((img, idx) => {
                          return range(brandModalIndex - 15, brandModalIndex + 15).includes(idx);
                        })
                        .map(({ src, width, height, id }, idx) => {
                          const indexInBrand = brandImages.findIndex((img) => img.id === id);
                          return (
                            <motion.button
                              key={id}
                              initial={{
                                width: "0%",
                                x: `${Math.max((brandModalIndex - 1) * -100, 15 * -100)}%`,
                              }}
                              animate={{
                                scale: indexInBrand === brandModalIndex ? 1.25 : 1,
                                width: "100%",
                                x: `${Math.max(brandModalIndex * -100, 15 * -100)}%`,
                              }}
                              exit={{ width: "0%" }}
                              onClick={() => setBrandModalIndex(indexInBrand)}
                              className={`${indexInBrand === brandModalIndex
                                ? "z-20 rounded-md shadow shadow-black/50"
                                : "z-10"
                                } ${indexInBrand === 0 ? "rounded-l-md" : ""
                                } ${indexInBrand === brandImages.length - 1 ? "rounded-r-md" : ""
                                } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                            >
                              <Image
                                alt="thumbnail"
                                width={180}
                                height={120}
                                className={`${indexInBrand === brandModalIndex
                                  ? "brightness-110 hover:brightness-110"
                                  : "brightness-75 contrast-125 hover:brightness-90"
                                  } h-full transform object-cover transition`}
                                src={src}
                              />
                            </motion.button>
                          );
                        })}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </main>
            )}
          </div>
        </div>
      )}

      {/* 전체 모달 */}
      {showAllModal && allImagesForModal.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/90 sm:bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            // 배경 클릭 시에만 모달 닫기
            if (e.target === e.currentTarget) {
              closeAllModal();
            }
          }}
        >
          <div
            className="relative w-full h-full max-w-[90rem] min-h-full sm:min-h-0 sm:max-h-[90vh] p-0 sm:p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col sm:flex-row gap-0 sm:gap-4 md:gap-6 lg:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 햄버거 버튼 */}
            <button
              type="button"
              className="fixed sm:hidden top-4 left-4 z-50 text-white text-2xl hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center bg-black/40 rounded-full"
              onClick={() => setShowAllSidebar(!showAllSidebar)}
              aria-label="카테고리 메뉴 토글"
            >
              {showAllSidebar ? "×" : "≡"}
            </button>

            {/* 닫기 버튼 */}
            <button
              type="button"
              className="fixed sm:absolute top-4 right-4 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 text-white text-4xl sm:text-3xl md:text-4xl hover:opacity-70 active:opacity-50 transition-opacity font-light leading-none touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center bg-black/40 sm:bg-transparent rounded-full sm:rounded-none"
              onClick={goToHome}
              aria-label="모달 닫기"
            >
              ×
            </button>

            {/* 왼쪽: 카테고리 메뉴 (모바일에서는 햄버거로 토글, 태블릿 이상에서는 항상 표시) */}
            <aside
              className={`fixed sm:relative top-0 left-0 h-full sm:h-auto w-64 sm:w-64 md:w-80 bg-black/95 sm:bg-transparent z-40 sm:z-auto transform transition-transform duration-300 ease-in-out ${showAllSidebar ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 sm:flex-none -ml-0 sm:-ml-4 md:-ml-8 mt-0 sm:mt-12 md:mt-10 lg:mt-16 space-y-4 sm:space-y-4 md:space-y-6 mr-0 sm:mr-12 md:mr-20 pt-16 sm:pt-0 px-6 sm:px-0`}
            >
              <div className="mb-6 sm:mb-6">
                <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide text-[#E45438]">
                  Menu
                </h2>
              </div>
              <nav className="space-y-3 sm:space-y-2 md:space-y-3 lg:space-y-4" aria-label="카테고리 메뉴">
                {CATEGORY_DEFS.map((cat, idx) => {
                  const isActive = cat.id === "ALL";
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`w-full flex items-center gap-3 sm:gap-2 md:gap-3 text-left p-3 sm:p-2 md:p-3 rounded-lg transition-colors touch-manipulation min-h-[52px] sm:min-h-[44px] active:bg-white/15 ${isActive
                        ? "bg-white/20 text-white font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/10 active:opacity-80"
                        }`}
                      onClick={() => {
                        if (cat.id === "ALL") return;
                        setShowAllModal(false);
                        if (cat.id === "EDITORIAL") {
                          setShowEditorialSidebar(false);
                          setShowEditorialModal(true);
                        } else if (cat.id === "POSTER") {
                          setShowPosterSidebar(false);
                          setShowPosterModal(true);
                        } else if (cat.id === "DIGITAL") {
                          setShowDigitalSidebar(false);
                          setShowDigitalModal(true);
                        } else if (cat.id === "BRAND") {
                          setShowBrandSidebar(false);
                          setShowBrandModal(true);
                        }
                      }}
                    >
                      <span className="text-xs sm:text-[10px] md:text-xs tracking-wider text-white/60 flex-shrink-0 font-medium">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span className="text-sm sm:text-xs md:text-sm lg:text-base font-medium break-words sm:truncate leading-tight">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* 모바일에서 사이드바 열려있을 때 오버레이 */}
            {showAllSidebar && (
              <div
                className="fixed sm:hidden inset-0 bg-black/50 z-30"
                onClick={() => setShowAllSidebar(false)}
              />
            )}

            {/* 오른쪽: 이미지 뷰어 */}
            <main className="flex-1 w-full sm:w-auto flex flex-col items-start justify-start relative pb-2 sm:pb-16 min-h-0 h-full sm:h-auto">
              {/* 이전 이미지 버튼 */}
              <button
                type="button"
                onClick={() => setAllModalIndex((prev) => (prev > 0 ? prev - 1 : allImagesForModal.length - 1))}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                aria-label="이전 이미지"
              >
                <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* 현재 이미지 */}
              {(() => {
                const currentImage = allImagesForModal[allModalIndex];
                const imageFileName = currentImage.src.split("/").pop() || "";
                const scrollableImages = ["모바일 디자인.jpg", "책자.jpg"];
                const isScrollable = scrollableImages.includes(imageFileName);

                return (
                  <div
                    className={`flex-1 flex w-full ${isScrollable
                      ? "items-start overflow-y-auto overflow-x-hidden"
                      : "items-start"
                      } justify-center ${isScrollable
                        ? "max-h-[45vh] sm:max-h-[calc(90vh-120px)] py-1"
                        : "max-h-[45vh] sm:max-h-[calc(90vh-120px)]"
                      } px-2 sm:px-4 md:px-0`}
                  >
                    <Image
                      src={currentImage.src}
                      width={currentImage.width}
                      height={currentImage.height}
                      alt={`김민지 포트폴리오 - ${currentImage.src
                        .split("/")
                        .pop()
                        ?.replace(/\.[^/.]+$/, "") || "포트폴리오 작업물"
                        }`}
                      className={`${isScrollable
                        ? "w-full h-auto min-h-full"
                        : "max-w-full max-h-full object-contain object-left-top"
                        } rounded-lg`}
                      priority
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
                    />
                  </div>
                );
              })()}

              {/* 다음 이미지 버튼 */}
              <button
                type="button"
                onClick={() => setAllModalIndex((prev) => (prev < allImagesForModal.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/60 sm:bg-black/50 p-1.5 sm:p-3 text-white/90 sm:text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white active:bg-black/80 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                aria-label="다음 이미지"
              >
                <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* 하단 썸네일 네비게이션 */}
              <div className="relative w-full z-30 overflow-hidden bg-gradient-to-b from-black/40 to-black/95 mt-2 sm:mt-4 pb-3 sm:pb-4">
                <motion.div
                  initial={false}
                  className="mx-auto mt-4 mb-2 flex aspect-[3/2] h-16 sm:h-20 max-w-5xl"
                >
                  <AnimatePresence initial={false}>
                    {allImagesForModal
                      .filter((img, idx) => {
                        return range(allModalIndex - 15, allModalIndex + 15).includes(idx);
                      })
                      .map(({ src, width, height, id }, idx) => {
                        const indexInAll = allImagesForModal.findIndex((img) => img.id === id);
                        return (
                          <motion.button
                            key={id}
                            initial={{
                              width: "0%",
                              x: `${Math.max((allModalIndex - 1) * -100, 15 * -100)}%`,
                            }}
                            animate={{
                              scale: indexInAll === allModalIndex ? 1.25 : 1,
                              width: "100%",
                              x: `${Math.max(allModalIndex * -100, 15 * -100)}%`,
                            }}
                            exit={{ width: "0%" }}
                            onClick={() => setAllModalIndex(indexInAll)}
                            className={`${indexInAll === allModalIndex
                              ? "z-20 rounded-md shadow shadow-black/50"
                              : "z-10"
                              } ${indexInAll === 0 ? "rounded-l-md" : ""
                              } ${indexInAll === allImagesForModal.length - 1 ? "rounded-r-md" : ""
                              } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                          >
                            <Image
                              alt="thumbnail"
                              width={180}
                              height={120}
                              className={`${indexInAll === allModalIndex
                                ? "brightness-110 hover:brightness-110"
                                : "brightness-75 contrast-125 hover:brightness-90"
                                } h-full transform object-cover transition`}
                              src={src}
                            />
                          </motion.button>
                        );
                      })}
                  </AnimatePresence>
                </motion.div>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}



