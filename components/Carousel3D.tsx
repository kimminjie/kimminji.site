"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ImageProps } from "../utils/types";

interface Carousel3DProps {
  imageData: ImageProps[]; // 이미지 정보 배열
  titles?: string[];
  slideSpeed?: number; // 슬라이드 속도 (기본값: 0.5)
}

export default function Carousel3D({
  imageData,
  titles,
  slideSpeed = 0.5
}: Carousel3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageData.length);
    }, 3000); // 3초마다 자동 슬라이드

    return () => clearInterval(interval);
  }, [imageData.length, mounted]);

  // 중앙에서의 거리 계산
  const getDistanceFromCenter = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    const wrappedDistance = Math.min(distance, imageData.length - distance);
    return wrappedDistance;
  };

  // 이미지 스타일 계산 함수 (원본 비율 유지)
  const getImageConfig = (index: number, image: ImageProps) => {
    const distance = getDistanceFromCenter(index);
    // 현재 인덱스와의 차이 계산 (순환 고려)
    let diff = index - currentIndex;
    if (Math.abs(diff) > imageData.length / 2) {
      diff = diff > 0 ? diff - imageData.length : diff + imageData.length;
    }
    const normalizedDiff = diff;

    // 원본 비율 계산
    const aspectRatio = image.width / image.height;

    // 최대 표시 크기 (비율 유지) - 오른쪽 배치에 맞게 조정
    let maxWidth: number;
    let maxHeight: number;

    if (distance === 0) {
      // 중앙 이미지 - 원본 크기 유지 (최대 크기 제한)
      maxWidth = isMobile ? 350 : 450;
      maxHeight = isMobile ? 450 : 600;
    } else if (distance === 1) {
      // 좌우 이미지 - 75% 크기
      maxWidth = isMobile ? 260 : 340;
      maxHeight = isMobile ? 340 : 450;
    } else {
      // 더 멀리 있는 이미지 - 50% 크기
      maxWidth = isMobile ? 175 : 225;
      maxHeight = isMobile ? 225 : 300;
    }

    // 비율에 맞춰 실제 크기 계산
    let displayWidth = maxWidth;
    let displayHeight = maxWidth / aspectRatio;

    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = maxHeight * aspectRatio;
    }

    if (distance === 0) {
      return {
        width: displayWidth,
        height: displayHeight,
        transform: 'perspective(1000px) rotateY(0deg)',
        opacity: 1,
        filter: 'blur(0px)',
        zIndex: 10,
      };
    } else if (distance === 1) {
      const rotateY = normalizedDiff < 0 ? -20 : 20;
      return {
        width: displayWidth,
        height: displayHeight,
        transform: `perspective(1000px) rotateY(${rotateY}deg)`,
        opacity: 0.7,
        filter: 'blur(1px)',
        zIndex: 5,
      };
    } else {
      return {
        width: displayWidth,
        height: displayHeight,
        transform: 'perspective(1000px) rotateY(0deg)',
        opacity: 0.4,
        filter: 'blur(3px)',
        zIndex: 1,
      };
    }
  };

  return (
    <div
      className="flex min-h-[80vh] items-center justify-center bg-black py-20 overflow-hidden"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
      >
        {/* 왼쪽 텍스트 영역 - 나중에 텍스트 추가 가능 */}
        <div className="hidden lg:block"></div>

        {/* 오른쪽 캐러셀 영역 테스트 용 ..*/}
        <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] flex items-center justify-center lg:justify-end">
          {imageData.map((image, index) => {
            const config = mounted ? getImageConfig(index, image) : {
              width: 400,
              height: 500,
              transform: 'perspective(1000px) rotateY(0deg)',
              opacity: 1,
              filter: 'blur(0px)',
              zIndex: 10,
            };

            // 현재 인덱스와의 차이 계산 (순환 고려)
            let diff = index - currentIndex;
            // 순환 배열에서 가장 짧은 거리 계산
            if (Math.abs(diff) > imageData.length / 2) {
              diff = diff > 0 ? diff - imageData.length : diff + imageData.length;
            }
            const translateX = diff * 400; // 이미지 간 간격 (오른쪽 배치에 맞게 조정)

            const ImageContent = (
              <div
                className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-700 ease-out"
                style={{
                  width: `${config.width}px`,
                  height: `${config.height}px`,
                  transform: config.transform,
                  opacity: config.opacity,
                  filter: config.filter,
                  zIndex: config.zIndex,
                }}
              >
                <Image
                  src={image.src}
                  alt={titles?.[index] || `Image ${index + 1}`}
                  width={image.width}
                  height={image.height}
                  className="object-contain w-full h-full"
                  priority={index < 2}
                  quality={95}
                />
              </div>
            );

            return (
              <div
                key={index}
                className="absolute cursor-pointer"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${translateX}px), -50%)`,
                  transition: 'transform 0.7s ease-out',
                }}
              >
                {image.id !== null && image.id !== undefined ? (
                  <Link href={`/?photoId=${image.id}`} className="block h-full w-full">
                    {ImageContent}
                  </Link>
                ) : (
                  ImageContent
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

