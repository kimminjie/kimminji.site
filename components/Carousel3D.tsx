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
    <div className="relative flex min-h-[88vh] items-center justify-center lg:justify-end bg-[#111111] py-10 px-4 overflow-x-hidden overflow-y-visible">
      {/* PORTFOLIO 텍스트 - 모션 뒤에 배치 */}
      <div className="absolute inset-0 flex items-end justify-center lg:justify-start lg:pl-16 lg:pb-12 pb-6 pointer-events-none z-0 overflow-visible">
        <h1
          className="font-black text-[10.625rem] lg:text-[15.625rem] leading-none whitespace-nowrap"
          style={{
            WebkitTextStroke: "2px #808080",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          } as React.CSSProperties}
        >
          PORTFOLIO
        </h1>
      </div>
      {/* Kim / Minji 텍스트 - PORTFOLIO 위에 배치 */}
      <div className="absolute inset-0 flex items-start justify-center lg:justify-start lg:pl-16 pt-4 pointer-events-none z-5">
        <div className="flex flex-col leading-none text-white font-bold text-[10.625rem] lg:text-[15.625rem]">
          <span>Kim</span>
          <span className="mt-2">Minji</span>
        </div>
      </div>




      {/* 모션 영역 - 원래 위치 그대로 유지 */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl lg:max-w-3xl mx-auto lg:mr-16 z-10"
        style={{ height: "88vh" }}
      >
        {phase === "first" && (
          <div
            className="relative w-full h-full overflow-x-hidden overflow-y-hidden transition-opacity duration-500 ease-in-out"
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
            className="relative w-full h-full flex items-center justify-center overflow-visible transition-opacity duration-500 ease-in-out"
            style={{ opacity: transitioningToFirst ? 0 : 1 }}
          >
            {/* 2번 모션 위/아래 블러 – 배경색(#111111)과 같게, 이미지 안쪽은 그대로 두고 바깥쪽만 덮는 느낌 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#111111] via-transparent to-transparent" />
            {/* 하단 블러 제거 - PORTFOLIO 텍스트가 보이도록 */}

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

