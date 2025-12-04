"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageProps } from "../utils/types";

interface AutoBookFlipProps {
  images: ImageProps[];
  onComplete?: () => void; // 모든 페이지 넘김 완료 시 호출
}

export default function AutoBookFlip({ images, onComplete }: AutoBookFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length === 0 || images.length === 1) return;

    let timeoutId: NodeJS.Timeout | null = null;
    let animationFrameId: number | null = null;

    const startFlip = () => {
      setIsFlipping(true);
      setFlipProgress(0);

      const duration = 800; // 0.8초
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // ease-out 커브
        const eased = 1 - Math.pow(1 - progress, 2.5);
        setFlipProgress(eased);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          // 애니메이션 완료
          setIsFlipping(false);
          setFlipProgress(0);
          setCurrentIndex((prev) => {
            const nextIndex = (prev + 1) % images.length;

            // 마지막 페이지(동화1.jpg)를 넘어가는 중이면 완료 콜백 호출 (표지가 다시 덮히지 않도록)
            if (prev === images.length - 1 && onComplete) {
              // 마지막 페이지 넘김 애니메이션 완료 후 0.8초 대기 후 페이드 아웃 시작
              timeoutId = setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  onComplete();
                }, 500);
              }, 800);
              // 마지막 페이지를 유지 (표지로 돌아가지 않음)
              return prev;
            } else {
              // 애니메이션 완료 후 0.8초 대기 후 다음 페이지 넘기기
              timeoutId = setTimeout(startFlip, 800);
              return nextIndex;
            }
          });
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    };

    // 첫 페이지 표시 후 0.8초 대기 후 넘기기 시작
    timeoutId = setTimeout(startFlip, 800);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{
        perspective: "2000px",
        perspectiveOrigin: "center center",
        opacity: isTransitioning ? 0 : 1,
        transition: isTransitioning ? "opacity 500ms ease-in-out" : "none",
      }}
    >
      {images.map((img, index) => {
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        const isFuture = index > currentIndex;

        // 현재 페이지: 화면 왼쪽에 선명하게 표시
        if (isCurrent) {
          if (isFlipping) {
            // 넘어가는 중: 왼쪽 → 오른쪽으로 회전하면서 블러 적용 및 바로 작아짐, 바로 블러 위치로 이동
            const rotateY = -flipProgress * 180; // 0도에서 -180도로 회전
            const translateZ = Math.sin(flipProgress * Math.PI) * 20; // 3D 깊이 효과
            const translateX = flipProgress * 376; // 10cm 오른쪽으로 이동
            const blurAmount = flipProgress * 3; // 0에서 3px로 증가
            const scale = 1 - flipProgress * 0.05; // 1에서 0.95로 바로 작아짐

            return (
              <div
                key={img.src}
                className="absolute inset-0 flex items-center justify-center will-change-transform"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center", // 왼쪽 가장자리 중심으로 회전
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  filter: `blur(${blurAmount}px)`,
                  zIndex: 30 - Math.floor(flipProgress * 10),
                  transition: "none",
                }}
              >
                <Image
                  src={img.src}
                  width={img.width}
                  height={img.height}
                  alt="Book page"
                  className="h-auto w-auto max-h-[70vh] rounded-lg shadow-2xl object-contain"
                  style={{
                    transform: flipProgress > 0.5 ? "scaleX(-1)" : "scaleX(1)",
                  }}
                />
              </div>
            );
          } else {
            // 정적 상태: 왼쪽에 표시
            return (
              <div
                key={img.src}
                className="absolute inset-0 flex items-center justify-center will-change-transform"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center",
                  transform: "translateX(0) translateZ(0) rotateY(0deg)",
                  zIndex: 30,
                  transition: "transform 600ms ease-out",
                }}
              >
                <Image
                  src={img.src}
                  width={img.width}
                  height={img.height}
                  alt="Book page"
                  className="h-auto w-auto max-h-[70vh] rounded-lg shadow-2xl object-contain"
                />
              </div>
            );
          }
        }

        // 넘어간 페이지: 현재 페이지 뒤쪽에 위치, 좌우반전 + blur, 겹쳐 쌓임
        if (isPast) {
          const translateX = 376; // 10cm (약 376px) 오른쪽으로 이동
          return (
            <div
              key={img.src}
              className="absolute inset-0 flex items-center justify-center will-change-transform"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: `translateX(${translateX}px) rotateY(-180deg) scale(0.95)`,
                filter: "blur(3px)",
                isolation: "isolate",
                zIndex: 20 - (currentIndex - index),
                transition: "none", // 고정 위치 유지
              }}
            >
              <Image
                src={img.src}
                width={img.width}
                height={img.height}
                alt="Book page"
                className="h-auto w-auto max-h-[70vh] rounded-lg shadow-2xl object-contain"
                style={{ transform: "scaleX(-1) !important" }}
              />
            </div>
          );
        }

        // 미래 페이지: 왼쪽에 쌓여있음 (선명하게, 고정 위치)
        if (isFuture) {
          const translateZ = 0; // 고정 위치

          return (
            <div
              key={img.src}
              className="absolute inset-0 flex items-center justify-center will-change-transform"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: `translateX(0) translateZ(${translateZ}px) rotateY(0deg)`,
                filter: "none",
                isolation: "isolate",
                zIndex: 25 - (index - currentIndex - 1),
                transition: "none", // 고정 위치 유지
              }}
            >
              <Image
                src={img.src}
                width={img.width}
                height={img.height}
                alt="Book page"
                className="h-auto w-auto max-h-[70vh] rounded-lg shadow-2xl object-contain"
                style={{ filter: "none !important" }}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

