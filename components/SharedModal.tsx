"use client";

import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { variants } from "../utils/animationVariants";
import { range } from "../utils/range";
import type { ImageProps, SharedModalProps } from "../utils/types";

export default function SharedModal({
  index,
  images,
  changePhotoId,
  closeModal,
  navigation,
  currentPhoto,
  direction,
}: SharedModalProps) {
  const [loaded, setLoaded] = useState(false);

  // index가 변경될 때마다 loaded 상태 리셋
  useEffect(() => {
    setLoaded(false);
  }, [index]);

  let filteredImages = images?.filter((img: ImageProps) =>
    range(index - 15, index + 15).includes(img.id),
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!navigation) return;
      if (index < images?.length - 1) {
        changePhotoId(index + 1);
      }
    },
    onSwipedRight: () => {
      if (!navigation) return;
      if (index > 0) {
        changePhotoId(index - 1);
      }
    },
    trackMouse: true,
  });

  let currentImage = images ? images[index] : currentPhoto;

  // 스크롤 가능한 이미지 목록 (세로로 긴 작업들)
  const scrollableImages = ["모바일 디자인.jpg", "책자.jpg", "프로필.png"];
  const imageFileName = currentImage.src.split("/").pop() || "";
  const isScrollable = scrollableImages.includes(imageFileName);
  const isProfileImage = imageFileName === "프로필.png";

  // 너무 위로 붙어 보이는 가로형 배너 이미지들 약간 아래로 내리기
  const downshiftImages = ["북커버.png", "파프리카 카드뉴스.jpg"];
  const isDownshift = downshiftImages.includes(imageFileName);

  // 동화 이미지들 (PDF 다운로드 버튼 표시)
  const storyImages = ["동화_표지.jpg", "동화.jpg", "동화1.jpg"];
  const isStoryImage = storyImages.includes(imageFileName);

  // 교보 e북 이미지 (외부 링크 버튼 표시)
  const isKyoboEbook = currentImage.src === "/images/교보 e북.png";
  const kyoboEbookUrl = "https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011155068";
  
  // e북 이미지 (네이버 쇼핑 링크 버튼 표시)
  const isEbook = currentImage.src === "/images/e북.png";
  const naverShoppingUrl = "https://search.shopping.naver.com/book/search?bookTabType=ALL&pageIndex=1&pageSize=40&query=%EC%88%B2%EC%9D%98%20%EC%A7%91&sort=REL";


  return (
    <MotionConfig
      transition={{
        x: { type: "tween", duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, ease: "easeInOut" },
      }}
    >
      <div
        className="relative z-50 flex w-full max-w-5xl items-center justify-center"
        style={{ height: "90vh", maxHeight: "90vh" }}
        {...(navigation ? handlers : {})}
      >
        {/* Main image */}
        <div
          className={`relative w-full ${isScrollable ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"}`}
          style={{ height: "90vh", maxHeight: "90vh" }}
        >
          <div
            className={`flex justify-center px-2 ${isScrollable
              ? "items-start py-4 min-h-full"
              : "items-center py-10"
              }`}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative"
              >
                <Image
                  src={currentImage.src}
                  width={currentImage.width}
                  height={currentImage.height}
                  priority
                  alt="Portfolio work"
                  onLoad={() => setLoaded(true)}
                  className={`max-w-full h-auto object-contain ${!isScrollable ? "max-h-[85vh]" : ""
                    } ${isDownshift ? "mt-12" : ""}`}
                  style={{ display: "block" }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Top buttons (close / actions) */}
        <div
          className={[
            "pointer-events-none absolute inset-x-0 top-8 z-50 flex max-w-5xl px-6",
            navigation ? "justify-between" : isProfileImage ? "justify-end" : "justify-start",
          ].join(" ")}
        >
          {/* Left: default close/back button (not for profile image) */}
          {!isProfileImage && (
            <div className="pointer-events-auto flex items-center gap-2 text-white">
              <button
                type="button"
                aria-label={navigation ? "Close" : "Back"}
                onClick={() => closeModal()}
                className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
              >
                {navigation ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <ArrowUturnLeftIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          )}

          {/* Right: actions (navigation only) */}
          {navigation && (
            <div className="pointer-events-auto flex items-center gap-2 text-white">
              {/* 교보 e북 이미지일 때 교보문고 링크 버튼 */}
              {isKyoboEbook && (
                <a
                  href={kyoboEbookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-black/50 px-4 py-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white text-sm font-medium"
                  title="교보문고 바로가기"
                >
                  교보문고 바로가기
                </a>
              )}
              {/* e북 이미지일 때 네이버 쇼핑 링크 버튼 */}
              {isEbook && (
                <a
                  href={naverShoppingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-black/50 px-4 py-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white text-sm font-medium"
                  title="e북 보러가기"
                >
                  e북 보러가기
                </a>
              )}
              {/* 동화 이미지일 때 PDF 다운로드 버튼 */}
              {isStoryImage && (
                <a
                  href="/e북 동화.pdf"
                  download="e북 동화.pdf"
                  className="rounded-full bg-black/50 px-4 py-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white text-sm font-medium"
                  title="PDF 다운로드"
                >
                  PDF 다운로드
                </a>
              )}
              {/* 이미지 저장 버튼 */}
              <a
                href={currentImage.src}
                download
                className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                title="이미지 저장"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </a>
              {/* 원본 크기로 열기 버튼 */}
              <a
                href={currentImage.src}
                className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                target="_blank"
                title="Open fullsize version"
                rel="noreferrer"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              </a>
            </div>
          )}

          {/* Right: profile image close (X) */}
          {isProfileImage && (
            <div className="pointer-events-auto flex items-center gap-2 text-white">
              <button
                type="button"
                aria-label="Close profile"
                onClick={() => closeModal()}
                className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Side navigation arrows */}
        {navigation && images && images.length > 0 && (
          <div className="pointer-events-none absolute inset-y-0 inset-x-0 z-40 flex max-w-5xl items-center justify-between px-4">
            <button
              className={`pointer-events-auto rounded-full p-3 backdrop-blur-lg transition focus:outline-none ${index > 0
                ? "bg-black/50 text-white/75 hover:bg-black/75 hover:text-white cursor-pointer"
                : "bg-black/20 text-white/30 cursor-not-allowed opacity-50"
                }`}
              onClick={(e) => {
                e.stopPropagation();
                if (index > 0) {
                  changePhotoId(index - 1);
                }
              }}
              disabled={index <= 0}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              className={`pointer-events-auto rounded-full p-3 backdrop-blur-lg transition focus:outline-none ${index < images.length - 1
                ? "bg-black/50 text-white/75 hover:bg-black/75 hover:text-white cursor-pointer"
                : "bg-black/20 text-white/30 cursor-not-allowed opacity-50"
                }`}
              onClick={(e) => {
                e.stopPropagation();
                if (index < images.length - 1) {
                  changePhotoId(index + 1);
                }
              }}
              disabled={index >= images.length - 1}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Bottom Nav bar */}
        {navigation && (
          <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-gradient-to-b from-black/0 to-black/60">
            <motion.div
              initial={false}
              className="mx-auto mt-6 mb-6 flex aspect-[3/2] h-14"
            >
              <AnimatePresence initial={false}>
                {filteredImages
                  ?.filter((img) => img.src !== "/images/프로필.png")
                  .map(({ src, width, height, id }) => (
                    <motion.button
                      initial={{
                        width: "0%",
                        x: `${Math.max((index - 1) * -100, 15 * -100)}%`,
                      }}
                      animate={{
                        scale: id === index ? 1.25 : 1,
                        width: "100%",
                        x: `${Math.max(index * -100, 15 * -100)}%`,
                      }}
                      exit={{ width: "0%" }}
                      onClick={() => changePhotoId(id)}
                      key={id}
                      className={`${id === index
                        ? "z-20 rounded-md shadow shadow-black/50"
                        : "z-10"
                        } ${id === 0 ? "rounded-l-md" : ""} ${id === images.length - 1 ? "rounded-r-md" : ""
                        } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                    >
                      <Image
                        alt="small photos on the bottom"
                        width={180}
                        height={120}
                        className={`${id === index
                          ? "brightness-110 hover:brightness-110"
                          : "brightness-50 contrast-125 hover:brightness-75"
                          } h-full transform object-cover transition`}
                        src={src}
                      />
                    </motion.button>
                  ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
