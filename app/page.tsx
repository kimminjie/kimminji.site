import getLocalImages from "../utils/getLocalImages";
import Gallery from "../components/Gallery";

export default function Home() {
  const images = getLocalImages();
  return <Gallery images={images} />;
}

