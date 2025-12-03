import Carousel from "../../../components/Carousel";
import getLocalImages from "../../../utils/getLocalImages";
import type { ImageProps } from "../../../utils/types";

export default function PhotoPage({ params }: { params: { photoId: string } }) {
  const images = getLocalImages();
  const photoId = Number(params.photoId);
  const currentPhoto = images.find((img) => img.id === photoId);

  if (!currentPhoto) {
    return <div>Photo not found</div>;
  }

  return (
    <main className="mx-auto max-w-[1960px] p-4">
      <Carousel currentPhoto={currentPhoto} index={photoId} />
    </main>
  );
}

export function generateStaticParams() {
  const images = getLocalImages();

  return images.map((img) => ({
    photoId: img.id.toString(),
  }));
}


