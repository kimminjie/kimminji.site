"use client";

import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useKeypress from "react-use-keypress";
import type { ImageProps } from "../utils/types";
import SharedModal from "./SharedModal";

export default function Modal({
  images,
  onClose,
}: {
  images: ImageProps[];
  onClose?: () => void;
}) {
  let overlayRef = useRef();
  const router = useRouter();
  const searchParams = useSearchParams();

  const photoId = searchParams.get("photoId");
  const initialIndex = Number(photoId) || 0;

  const [direction, setDirection] = useState(0);
  const [curIndex, setCurIndex] = useState(initialIndex);
  const indexRef = useRef(initialIndex);

  // curIndex가 변경될 때 ref 업데이트
  useEffect(() => {
    indexRef.current = curIndex;
  }, [curIndex]);

  // photoId가 변경될 때 curIndex 업데이트
  useEffect(() => {
    if (photoId !== null) {
      const newIndex = Number(photoId) || 0;
      if (newIndex >= 0 && newIndex < images.length) {
        setCurIndex(newIndex);
        indexRef.current = newIndex;
      }
    }
  }, [photoId, images.length]);

  function handleClose() {
    router.push("/");
    onClose();
  }

  function changePhotoId(newVal: number) {
    // 유효한 범위 체크
    if (newVal < 0 || newVal >= images.length) {
      return;
    }
    
    const prevIndex = indexRef.current;
    
    // 방향 설정
    if (newVal > prevIndex) {
      setDirection(1);
    } else {
      setDirection(-1);
    }
    
    // 상태 업데이트
    setCurIndex(newVal);
    indexRef.current = newVal;
    
    // URL 업데이트
    router.push(`/?photoId=${newVal}`);
  }

  useKeypress("ArrowRight", () => {
    const current = indexRef.current;
    if (current + 1 < images.length) {
      changePhotoId(current + 1);
    }
  });

  useKeypress("ArrowLeft", () => {
    const current = indexRef.current;
    if (current > 0) {
      changePhotoId(current - 1);
    }
  });

  return (
    <Dialog
      static
      open={true}
      onClose={handleClose}
      initialFocus={overlayRef}
      className="fixed inset-0 z-10 flex items-center justify-center"
    >
      <Dialog.Overlay
        ref={overlayRef}
        as={motion.div}
        key="backdrop"
        className="fixed inset-0 z-30 bg-[#111111]/80 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <SharedModal
        index={curIndex}
        direction={direction}
        images={images}
        changePhotoId={changePhotoId}
        closeModal={handleClose}
        navigation={true}
      />
    </Dialog>
  );
}
