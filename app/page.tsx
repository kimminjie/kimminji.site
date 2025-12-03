import { Suspense } from "react";
import getLocalImages from "../utils/getLocalImages";
import Gallery from "../components/Gallery";

export default function Home() {
  const images = getLocalImages();
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-white">Loading...</div>}>
      <Gallery images={images} />
    </Suspense>
  );
}

