"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ImageProps } from "../utils/types";
import AutoBookFlip from "./AutoBookFlip";

export type CategoryId = "ALL" | "EDITORIAL" | "POSTER" | "DIGITAL" | "BRAND";

interface Carousel3DProps {
  imageData: ImageProps[];      // 1, 2번 모션용
  thirdImages?: ImageProps[];  // 3번 모션용
  profileImageId?: number;      // 프로필 이미지 id
  onMenuClick?: () => void;     // 상단 MENU 클릭 시 호출 (카테고리 드롭다운 토글)
  showCategoryMenu?: boolean;   // 카테고리 드롭다운 열림 여부
  selectedCategory?: CategoryId;
  onCategorySelect?: (id: CategoryId) => void;
}

export default function Carousel3D({
  imageData,
  thirdImages = [],
  profileImageId,
  onMenuClick,
  showCategoryMenu,
  selectedCategory = "ALL",
  onCategorySelect,
}: Carousel3DProps) {
  const router = useRouter();
  const [scrollPosition, setScrollPosition] = useState(0);
  // phase 순서: "second"(1번 모션: 보도니 3D 캐러셀) -> "first"(2번 모션: 모바일 세로 스크롤) -> "third"(3번 모션: 동화책) -> "second" -> 반복
  // 주의: phase "second" = 1번 모션, phase "first" = 2번 모션, phase "third" = 3번 모션
  const [phase, setPhase] = useState<"first" | "second" | "third">("second");
  const [currentIndex, setCurrentIndex] = useState(0); // 2번 모션용
  const [transitioningToFirst, setTransitioningToFirst] = useState(false);
  const [transitioningToThird, setTransitioningToThird] = useState(false);
  const [transitioningToSecond, setTransitioningToSecond] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const [imageHeight, setImageHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 1번 모션용 첫 번째 이미지 (세로 스크롤), 나머지는 2번 모션용 3D 캐러셀
  const firstImage = imageData[0];
  const secondMotionImages = imageData.slice(1);

  useEffect(() => {
    setMounted(true);
    const updateIsMobile = () => setIsMobile(window.innerWidth < 1024);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);

    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }

    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, []);

  // phase 전환 시 필요한 상태 리셋
  useEffect(() => {
    if (phase === "first") {
      setScrollPosition(0);
    } else if (phase === "second") {
      setCurrentIndex(0);
    }
  }, [phase]);

  // 이미지 로드 후 높이 계산
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // 실제 렌더링된 이미지 높이 가져오기
    if (imageWrapperRef.current) {
      const actualHeight = imageWrapperRef.current.scrollHeight;
      setImageHeight(actualHeight);
    }
  };

  // 2번 모션: 한 페이지씩 스크롤하고 1.5초 대기 반복 (3번 스크롤 후 4번째에서 3번 모션으로 전환)
  useEffect(() => {
    if (!firstImage || !mounted || imageHeight === 0 || containerHeight === 0 || phase !== "first") {
      return;
    }

    const maxScroll = Math.max(0, imageHeight - containerHeight);
    if (maxScroll <= 0) return;

    let timeoutId: NodeJS.Timeout | null = null;
    let transitionTimeout: NodeJS.Timeout | null = null;
    let currentStep = 0;

    const scrollStep = () => {
      const nextPosition = (currentStep + 1) * containerHeight;
      const clampedPosition = Math.min(nextPosition, maxScroll);

      // 한 페이지만큼 스크롤
      setScrollPosition(clampedPosition);
      currentStep++;

      // 3번 스크롤 이후, 4번째 스크롤 하면서 3번 모션으로 부드럽게 전환
      if (currentStep >= 4 || clampedPosition >= maxScroll) {
        // 4번째 스크롤 시작 시 페이드 아웃 시작
        setTransitioningToThird(true);
        transitionTimeout = setTimeout(() => {
          // 페이드 아웃 완료 후 3번 모션으로 전환
          setPhase("third");
          setTransitioningToThird(false);
        }, 500);
        return;
      }

      // 1.5초 대기 후 다음 스크롤
      timeoutId = setTimeout(() => {
        scrollStep();
      }, 1500);
    };

    // 모션이 시작되면 즉시 첫 스크롤을 실행
    scrollStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (transitionTimeout) clearTimeout(transitionTimeout);
    };
  }, [firstImage, imageHeight, containerHeight, mounted, phase]);

  // 1번 모션: 3D 캐러셀 회전 (보도니)
  useEffect(() => {
    if (!mounted || phase !== "second" || secondMotionImages.length === 0) return;

    setCurrentIndex(0);

    let transitionTimeout: NodeJS.Timeout | null = null;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % secondMotionImages.length;

        const currentImg = secondMotionImages[prev];
        const nextImg = secondMotionImages[next];

        // 책자 3.jpg 에서 책자 4.jpg 로 넘어갈 때 2번 모션(모바일 세로 스크롤)으로 전환
        if (
          currentImg?.src.endsWith("/책자 3.jpg") &&
          nextImg?.src.endsWith("/책자 4.jpg")
        ) {
          clearInterval(interval);
          setTransitioningToFirst(true);
          transitionTimeout = setTimeout(() => {
            setPhase("first");
            setTransitioningToFirst(false);
          }, 500); // 부드러운 페이드 아웃 후 전환
        }

        return next;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      if (transitionTimeout) clearTimeout(transitionTimeout);
    };
  }, [mounted, phase, secondMotionImages.length]);


  if (!firstImage) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#FEFBF9] py-20">
        {/* 이미지를 찾을 수 없습니다 */}
      </div>
    );
  }

  const CATEGORY_DEFS: { id: CategoryId; label: string }[] = [
    { id: "ALL", label: "전체" },
    { id: "EDITORIAL", label: "편집 · 출판 디자인" },
    { id: "POSTER", label: "포스터 · 비주얼 그래픽" },
    { id: "DIGITAL", label: "디지털 콘텐츠 디자인" },
    { id: "BRAND", label: "브랜드 · 패키지 디자인" },
  ];

  // OS별 한글/영문/숫자 폴백이 섞여 보이는 걸 방지하기 위해, 이 영역만 폰트 스택을 고정
  const uiSansFamily =
    '"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR","Segoe UI",system-ui,sans-serif';

  const headerTextButtonBase =
    "inline-flex items-center justify-center select-none leading-none text-[#E45438] font-sans font-bold text-xl sm:text-2xl md:text-3xl tracking-wide transition-transform transition-colors duration-150 ease-out hover:text-[#C63B25] hover:scale-[1.06] active:scale-[0.98] focus-visible:outline-none focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

  return (
    <div
      className="relative flex flex-col lg:flex-row min-h-[88vh] items-center justify-center lg:justify-end rounded-b-2xl py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-6 lg:px-10 overflow-x-hidden overflow-y-auto lg:overflow-y-hidden gap-4 sm:gap-6"
      style={{ backgroundColor: '#F7F5F2' }}
    >
      {/* 상단 회색 스트립 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 z-20"></div>

      {/* 상단 고정 헤더 배경 (블러) */}
      <div className="fixed top-0 left-0 right-0 z-30 h-20 sm:h-20 lg:h-24 backdrop-blur-md bg-[#F7F5F2]/80"></div>

      {/* 헤더 텍스트 */}
      <div
        className="absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-12 z-20 flex flex-col max-w-[calc(100vw-2rem)]"
        style={{ fontFamily: uiSansFamily }}
      >
        <div className="ml-1 lg:ml-2 text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#E45438] font-sans font-bold tracking-wide break-words">
          KIM MINJI
        </div>
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif text-[#E45438] font-bold mt-4 sm:mt-6 lg:mt-8 leading-none break-words">
          PROJECTS
        </div>
      </div>

      {/* 상단 고정 KIM MINJI (헤더용) */}
      <div
        className="fixed top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-12 z-50 flex flex-col max-w-[calc(100vw-2rem)]"
        style={{ fontFamily: uiSansFamily }}
      >
        <div className="ml-1 lg:ml-2 text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#E45438] font-sans font-bold tracking-wide break-words">
          KIM MINJI
        </div>
      </div>

      {/* 좌측 하단: 연락처 (아이콘 + 텍스트) */}
      <div
        className="absolute left-2 sm:left-4 md:left-6 lg:left-12 bottom-16 sm:bottom-24 md:bottom-28 lg:bottom-32 z-20 font-sans w-[calc(100vw-1rem)] sm:w-[min(92vw,900px)] max-w-[calc(100vw-2rem)]"
        style={{ fontFamily: uiSansFamily }}
      >
        {/* 2행 x 2열로 고정해서 행 정렬 맞추기 */}
        <div className="grid grid-cols-1 sm:grid-cols-[auto_auto] sm:grid-rows-2 gap-x-4 sm:gap-x-6 md:gap-x-10 gap-y-2 items-start sm:items-center text-[#E45438]">
          {/* phone */}
          <div className="flex items-center gap-3 sm:col-start-1 sm:row-start-1">
            <span
              className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#E45438]"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 3.75c.5 0 .94.31 1.12.78l1.06 2.75c.16.41.05.88-.28 1.18l-1.3 1.2a1 1 0 0 0-.27 1.02c.55 1.78 1.6 3.62 3.13 5.16 1.54 1.54 3.38 2.58 5.16 3.13a1 1 0 0 0 1.02-.27l1.2-1.3c.3-.33.77-.44 1.18-.28l2.75 1.06c.47.18.78.62.78 1.12V20a2 2 0 0 1-2 2h-.5C10.49 22 2 13.51 2 3.5V3a2 2 0 0 1 2-2h3.5Z"
                  fill="white"
                />
              </svg>
            </span>
            <a
              href="tel:010-2840-5951"
              className="text-sm sm:text-base md:text-xl leading-none tracking-wide cursor-default whitespace-nowrap touch-manipulation"
              aria-label="전화하기: 010-2840-5951"
            >
              010 - 2840 - 5951
            </a>
          </div>

          {/* email */}
          <div className="flex items-center gap-3 sm:col-start-1 sm:row-start-2">
            <span
              className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#E45438]"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
                  fill="white"
                  fillOpacity="0"
                />
                <path
                  d="M6.5 6h11A1.5 1.5 0 0 1 19 7.5v.26l-6.37 4.06a1.25 1.25 0 0 1-1.26 0L5 7.76V7.5A1.5 1.5 0 0 1 6.5 6Zm12.5 3.05-5.83 3.72a3.25 3.25 0 0 1-3.34 0L5 9.05V17.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V9.05Z"
                  fill="white"
                />
              </svg>
            </span>
            <a
              href="mailto:nnind0112@gmail.com"
              className="text-sm sm:text-base md:text-xl leading-none tracking-wide cursor-default break-all sm:break-normal touch-manipulation"
              aria-label="이메일 보내기: nnind0112@gmail.com"
            >
              nnind0112@gmail.com
            </a>
          </div>

          {/* name */}
          <div className="flex items-center divide-x divide-[#E45438]/40 text-sm sm:text-base md:text-xl leading-none tracking-wide sm:col-start-2 sm:row-start-1 sm:-translate-x-10">
            <span className="pr-4 font-semibold">김민지</span>
            <span className="pl-4 opacity-80">Kim Min Ji</span>
          </div>

          {/* birth / address */}
          <div className="flex items-center divide-x divide-[#E45438]/40 text-sm sm:text-base md:text-xl leading-none tracking-wide sm:col-start-2 sm:row-start-2 sm:-translate-x-10">
            <span className="pr-4 tabular-nums opacity-80">2005.01.12</span>
            <span className="pl-4 opacity-80">서울특별시 관악구</span>
          </div>
        </div>

        {/* tools icons */}
        {/* mobile: wrap */}
        <div className="mt-8 flex flex-wrap items-end gap-4 sm:hidden">
          <Image
            src="/Adobe_Illustrator.png"
            alt="Adobe Illustrator"
            width={72}
            height={72}
            className="h-12 w-12 object-contain shrink-0"
          />
          <Image
            src="/Adobe_Photoshop.png"
            alt="Adobe Photoshop"
            width={72}
            height={72}
            className="h-12 w-12 object-contain shrink-0"
          />
          <Image
            src="/Adobe_Indesign.png"
            alt="Adobe InDesign"
            width={64}
            height={64}
            className="h-11 w-11 object-contain shrink-0"
          />
          <Image
            src="/Adobe_After_Effects.png"
            alt="Adobe After Effects"
            width={64}
            height={64}
            className="h-11 w-11 object-contain shrink-0"
          />
          <Image
            src="/B_figma.png"
            alt="Figma"
            width={64}
            height={64}
            className="h-11 w-11 object-contain shrink-0"
          />
        </div>

        {/* sm+: keep layout */}
        <div className="mt-10 hidden sm:flex w-full items-end">
          {/* left group: Ai + Ps (closer together) */}
          <div className="flex items-end gap-6">
            <Image
              src="/Adobe_Illustrator.png"
              alt="Adobe Illustrator"
              width={96}
              height={96}
              className="h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] md:h-[72px] md:w-[72px] object-contain shrink-0"
            />
            <Image
              src="/Adobe_Photoshop.png"
              alt="Adobe Photoshop"
              width={96}
              height={96}
              className="h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] md:h-[72px] md:w-[72px] object-contain shrink-0"
            />
          </div>

          {/* spacer: move the right group further left (1:3 split) */}
          <div className="hidden sm:block flex-[1]" />

          {/* right group */}
          <div className="flex items-end gap-6">
            <Image
              src="/Adobe_Indesign.png"
              alt="Adobe InDesign"
              width={80}
              height={80}
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain shrink-0"
            />
            <Image
              src="/Adobe_After_Effects.png"
              alt="Adobe After Effects"
              width={80}
              height={80}
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain shrink-0"
            />
            <Image
              src="/B_figma.png"
              alt="Figma"
              width={80}
              height={80}
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain shrink-0"
            />
          </div>

          <div className="hidden sm:block flex-[3]" />
        </div>
      </div>

      {/* 중앙: PROFILE (고정) */}
      <button
        type="button"
        aria-label="Open profile"
        disabled={profileImageId === undefined}
        className={[
          "fixed top-6 lg:top-8 left-1/2 -translate-x-1/2 z-50",
          headerTextButtonBase,
          "touch-manipulation min-w-[44px] min-h-[44px]",
        ].join(" ")}
        style={{ fontFamily: uiSansFamily }}
        onClick={() => {
          if (profileImageId !== undefined) {
            router.push(`/?photoId=${profileImageId}`);
          }
        }}
      >
        PROFILE
      </button>

      {/* 오른쪽: MENU 버튼 (고정) */}
      <div className="fixed top-6 lg:top-8 right-4 sm:right-6 lg:right-12 z-50 flex flex-col items-end space-y-2">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={!!showCategoryMenu}
          disabled={!onMenuClick}
          className={[
            headerTextButtonBase,
            "p-2 -m-2 touch-manipulation min-w-[44px] min-h-[44px]",
          ].join(" ")}
          style={{ fontFamily: uiSansFamily }}
          onClick={onMenuClick}
        >
          {/* mobile hamburger */}
          <span className="md:hidden inline-flex flex-col justify-center gap-1" aria-hidden="true">
            <span className="h-0.5 w-7 rounded bg-current" />
            <span className="h-0.5 w-7 rounded bg-current" />
            <span className="h-0.5 w-7 rounded bg-current" />
          </span>
          {/* desktop text */}
          <span className="hidden md:inline">MENU</span>
        </button>
      </div>

      {/* 전체 화면 카테고리 메뉴 오버레이 */}
      {showCategoryMenu && (
        <div className="fixed inset-0 z-40 flex items-start justify-start sm:items-center sm:justify-center bg-black/70 sm:bg-black/40 backdrop-blur-md transition-opacity overflow-y-auto">
          <div className="w-full max-w-5xl px-5 sm:px-6 md:px-10 py-8 sm:py-6 md:py-0 flex flex-col sm:flex-row items-start justify-start relative min-h-full sm:min-h-0">
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="fixed sm:absolute top-4 right-4 sm:top-2 sm:right-2 md:top-0 md:right-0 text-white text-4xl sm:text-3xl md:text-4xl hover:opacity-80 active:opacity-60 transition-opacity touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center z-50 bg-black/30 sm:bg-transparent rounded-full sm:rounded-none"
              onClick={onMenuClick}
              aria-label="메뉴 닫기"
            >
              ×
            </button>

            {/* 왼쪽 큰 MENU 텍스트 */}
            <div className="flex-none w-full sm:w-32 md:w-40 mb-10 sm:mb-0 sm:mr-12 md:mr-16 lg:mr-28 mt-2 sm:mt-0">
              <h2 className="text-[#E45438] font-sans text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold">
                Menu
              </h2>
            </div>

            {/* 오른쪽 카테고리 리스트 */}
            <nav className="flex-1 w-full space-y-6 sm:space-y-4 md:space-y-6 lg:space-y-8 text-white pt-2 sm:pt-0" aria-label="카테고리 메뉴">
              {CATEGORY_DEFS.map((cat, idx) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`w-full flex items-center justify-between border-b border-white/25 pb-5 sm:pb-3 md:pb-4 last:border-b-0 transition-colors touch-manipulation min-h-[60px] sm:min-h-[48px] md:min-h-[44px] active:bg-white/10 ${isActive
                      ? "text-white font-bold"
                      : "text-white/90 hover:text-white active:opacity-80"
                      }`}
                    onClick={() => onCategorySelect && onCategorySelect(cat.id)}
                    aria-label={`${cat.label} 카테고리 선택`}
                  >
                    <div className="flex items-center gap-3 sm:gap-2 md:gap-4 flex-1 min-w-0">
                      <span className="text-xs sm:text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/60 flex-shrink-0 font-medium">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span className="font-sans text-xl sm:text-lg md:text-2xl lg:text-3xl font-semibold break-words sm:break-normal sm:truncate leading-tight">
                        {cat.label}
                      </span>
                    </div>
                    <span className="text-lg sm:text-sm md:text-base text-white/70 flex-shrink-0 ml-3 sm:ml-2" aria-hidden="true">↗</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 모션 영역 */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl lg:max-w-3xl mx-auto lg:mr-16 z-10 rounded-b-2xl mt-16 sm:mt-20 lg:mt-24 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8"
        style={{ height: "88vh", minHeight: "400px" }}
      >
        {phase === "first" && (
          <div
            className="relative w-full h-full overflow-x-hidden overflow-y-hidden transition-opacity duration-500 ease-in-out"
            style={{
              height: "88vh",
              opacity: transitioningToThird ? 0 : 1,
            }}
          >
            {/* 2번 모션 위/아래 블러 – 원래 상태(그라데이션)로 복원 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#F7F5F2] via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#F7F5F2] via-transparent to-transparent" />

            <div
              ref={imageWrapperRef}
              className="relative w-full transition-transform duration-1000 ease-in-out"
              style={{
                transform: `translateY(-${scrollPosition}px)`,
              }}
            >
              <Image
                src={firstImage.src}
                width={firstImage.width}
                height={firstImage.height}
                alt="김민지 포트폴리오 작업물 - 모바일 디자인"
                className="w-full h-auto object-contain"
                priority
                onLoad={handleImageLoad}
                sizes="100vw"
              />
            </div>
          </div>
        )}

        {phase === "second" && secondMotionImages.length > 0 && (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-visible transition-opacity duration-500 ease-in-out"
            style={{ opacity: transitioningToFirst ? 0 : 1 }}
          >

            {secondMotionImages.map((img, index) => {
              const total = secondMotionImages.length;
              let diff = index - currentIndex;
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const absDiff = Math.abs(diff);
              const baseTranslateX = isMobile ? 0 : 260;

              let translateX = diff * baseTranslateX;
              let scale = 1;
              let rotateY = 0;
              let opacity = 1;
              let zIndex = 10 - absDiff;

              if (isMobile) {
                translateX = 0;
                rotateY = 0;
                scale = absDiff === 0 ? 1 : 0.96;
                opacity = absDiff === 0 ? 1 : 0;
                zIndex = absDiff === 0 ? 10 : 0;
              } else if (absDiff === 0) {
                scale = 1;
                rotateY = 0;
                opacity = 1;
              } else if (absDiff === 1) {
                scale = 0.85;
                // 회전 방향 반전
                rotateY = diff < 0 ? -20 : 20;
                opacity = 0.9;
              } else {
                // 너무 멀리 있는 카드들은 화면에 보이지 않도록 처리
                scale = 0.7;
                rotateY = diff < 0 ? -30 : 30;
                opacity = 0; // 완전히 숨김
              }

              return (
                <div
                  key={img.src}
                  className="absolute will-change-transform z-20"
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale}) perspective(1200px) rotateY(${rotateY}deg)`,
                    transition: "transform 800ms ease-in-out, opacity 800ms ease-in-out",
                    opacity,
                    zIndex,
                  }}
                >
                  <Image
                    src={img.src}
                    width={img.width}
                    height={img.height}
                    alt="김민지 포트폴리오 작업물"
                    className="h-auto w-auto max-h-[130vh] rounded-lg shadow-2xl object-contain"
                    priority={index === currentIndex}
                    sizes="(max-width: 1024px) 100vw, 80vw"
                  />
                </div>
              );
            })}
          </div>
        )}

        {phase === "third" && thirdImages.length > 0 && (
          <div className="relative w-full h-full">
            <AutoBookFlip
              images={thirdImages}
              onComplete={() => {
                // 3번 모션 완료 후(동화1.jpg 넘어갈 때) 1번 모션(보도니)으로 부드럽게 전환하여 반복
                setTimeout(() => {
                  setPhase("second");
                }, 500);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

