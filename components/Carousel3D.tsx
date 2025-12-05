"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ImageProps } from "../utils/types";
import AutoBookFlip from "./AutoBookFlip";

interface Carousel3DProps {
  imageData: ImageProps[];      // 1, 2번 모션용
  thirdImages?: ImageProps[];  // 3번 모션용
  profileImageId?: number;      // 프로필 이미지 id
}

export default function Carousel3D({
  imageData,
  thirdImages = [],
  profileImageId,
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

  // 1번 모션용 첫 번째 이미지 (세로 스크롤), 나머지는 2번 모션용 3D 캐러셀
  const firstImage = imageData[0];
  const secondMotionImages = imageData.slice(1);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
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
      <div className="flex min-h-[80vh] items-center justify-center bg-[#111111] py-20">
        {/* 이미지를 찾을 수 없습니다 */}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[88vh] items-center justify-center lg:justify-end bg-[#111111] py-10 px-4 overflow-x-hidden">
      {/* 왼쪽 텍스트 영역 - Designed by */}
      <div className="hidden lg:block absolute left-[calc(3rem+10cm)] top-[calc(5%+3cm)] z-10">
        {/* 빨간 네모: Designed (큰 글씨) + by (작은 글씨) */}
        <div className="flex items-start gap-2 -mt-8">
          <span
            className="text-white text-7xl lg:text-8xl font-light italic -ml-4"
            style={{ transform: 'scaleY(1.5)', display: 'inline-block' }}
          >
            Designed
          </span>
          <span className="text-white text-3xl lg:text-4xl font-light mt-[6rem]">
            by
          </span>
        </div>
      </div>

      {/* 왼쪽 텍스트 영역 - Kim Minji */}
      <div className="hidden lg:block absolute left-16 top-[28%] z-10">
        <div className="space-y-0">
          {/* 파란 네모: Kim */}
          <div>
            <p
              className="text-white text-[12rem] lg:text-[14rem] font-bold cursor-pointer hover:opacity-80 transition-opacity leading-none"
              onClick={() => {
                if (profileImageId !== undefined) {
                  // 현재 스크롤 위치 저장
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("profileModalScrollY", window.scrollY.toString());
                    sessionStorage.setItem("profileModalId", profileImageId.toString());
                  }
                  router.push(`/?photoId=${profileImageId}`);
                }
              }}
            >
              Kim
            </p>
          </div>
          {/* 보라색 네모: Minji */}
          <div className="-mt-48">
            <p className="text-white text-[10rem] lg:text-[13rem] font-bold leading-none">
              Minji
            </p>
          </div>
        </div>
      </div>

      {/* 연락처 - 고정 위치 */}
      <div className="hidden lg:block absolute left-16 top-[90%] z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                fill="#EF4444"
              />
            </svg>
            <span className="text-white text-base lg:text-lg">
              010 - 2840 - 5951
            </span>
          </div>
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                fill="#EF4444"
              />
              <path
                d="m22 6-10 7L2 6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="text-white text-base lg:text-lg">
              nnind0112@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* 모바일에서 텍스트 표시 - Designed by */}
      <div className="lg:hidden w-full mb-8 text-center">
        {/* 빨간 네모: Designed (큰 글씨) + by (작은 글씨) */}
        <div className="flex items-start justify-center gap-2 -mt-12">
          <span
            className="text-white text-7xl font-light italic -ml-4"
            style={{ transform: 'scaleY(1.5)', display: 'inline-block' }}
          >
            Designed
          </span>
          <span className="text-white text-3xl font-light mt-[6rem]">
            by
          </span>
        </div>
      </div>

      {/* 모바일에서 텍스트 표시 - Kim Minji */}
      <div className="lg:hidden w-full mb-8 text-center mt-8">
        <div className="space-y-0">
          {/* 파란 네모: Kim */}
          <div>
            <p
              className="text-white text-[12rem] font-bold cursor-pointer hover:opacity-80 transition-opacity leading-none"
              onClick={() => {
                if (profileImageId !== undefined) {
                  // 현재 스크롤 위치 저장
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("profileModalScrollY", window.scrollY.toString());
                    sessionStorage.setItem("profileModalId", profileImageId.toString());
                  }
                  router.push(`/?photoId=${profileImageId}`);
                }
              }}
            >
              Kim
            </p>
          </div>
          {/* 보라색 네모: Minji */}
          <div className="-mt-48">
            <p className="text-white text-[10rem] font-bold leading-none">
              Minji
            </p>
          </div>
        </div>
      </div>

      {/* 모바일에서 텍스트 표시 - 연락처 */}
      <div className="lg:hidden w-full mb-8 text-center mt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                fill="#EF4444"
              />
            </svg>
            <span className="text-white text-base">
              010 - 2840 - 5951
            </span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                fill="#EF4444"
              />
              <path
                d="m22 6-10 7L2 6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="text-white text-base">
              nnind0112@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* 모션 영역 - 원래 위치 그대로 유지 */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl lg:max-w-3xl mx-auto lg:mr-16"
        style={{ height: "88vh" }}
      >
        {phase === "first" && (
          <div
            className="relative w-full h-full overflow-hidden transition-opacity duration-500 ease-in-out"
            style={{
              height: "88vh",
              opacity: transitioningToThird ? 0 : 1,
            }}
          >
            {/* 위쪽 블러 / 그라데이션 – 전체 배경색(#111111)과 동일한 색으로 경계만 부드럽게 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-gradient-to-b from-[#111111] via-[#111111]/60 to-transparent" />
            {/* 아래쪽 블러 / 그라데이션 – 전체 배경색(#111111)과 동일 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent" />

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
                alt="Motion image"
                className="w-full h-auto object-contain"
                priority
                onLoad={handleImageLoad}
              />
            </div>
          </div>
        )}

        {phase === "second" && secondMotionImages.length > 0 && (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-visible bg-[#111111] transition-opacity duration-500 ease-in-out"
            style={{ opacity: transitioningToFirst ? 0 : 1 }}
          >
            {/* 2번 모션 위/아래 블러 – 배경색(#111111)과 같게, 이미지 안쪽은 그대로 두고 바깥쪽만 덮는 느낌 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#111111] via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />

            {secondMotionImages.map((img, index) => {
              const total = secondMotionImages.length;
              let diff = index - currentIndex;
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const absDiff = Math.abs(diff);
              const baseTranslateX = 260;

              let translateX = diff * baseTranslateX;
              let scale = 1;
              let rotateY = 0;
              let opacity = 1;
              let zIndex = 10 - absDiff;

              if (absDiff === 0) {
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
                    alt="Bodoni editorial"
                    className="h-auto w-auto max-h-[70vh] rounded-lg shadow-2xl object-contain"
                    priority={index === currentIndex}
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

