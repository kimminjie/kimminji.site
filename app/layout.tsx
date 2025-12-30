import type { Metadata, Viewport } from "next";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "김민지 포트폴리오 | 시각디자이너",
  description: "보이는 결과뿐 아니라, 소통의 과정도 함께하는 디자이너 김민지입니다. 편집·출판 디자인, 포스터·비주얼 그래픽, 디지털 콘텐츠 디자인, 브랜드·패키지 디자인 포트폴리오",
  keywords: ["김민지", "포트폴리오", "시각디자인", "그래픽디자인", "편집디자인", "포스터디자인", "브랜드디자인", "패키지디자인", "디지털디자인"],
  authors: [{ name: "김민지" }],
  creator: "김민지",
  publisher: "김민지",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.kimminji.site"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "김민지 포트폴리오 | 시각디자이너",
    description: "보이는 결과뿐 아니라, 소통의 과정도 함께하는 디자이너 김민지입니다.",
    siteName: "김민지 포트폴리오",
    images: [
      {
        url: "/프로필.png",
        width: 1200,
        height: 630,
        alt: "김민지 포트폴리오",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "김민지 포트폴리오 | 시각디자이너",
    description: "보이는 결과뿐 아니라, 소통의 과정도 함께하는 디자이너 김민지입니다.",
    images: ["/프로필.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F2" },
    { media: "(prefers-color-scheme: dark)", color: "#F7F5F2" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "김민지",
    alternateName: "Kim Min Ji",
    jobTitle: "시각디자이너",
    description: "보이는 결과뿐 아니라, 소통의 과정도 함께하는 디자이너 김민지입니다.",
    email: "nnind0112@gmail.com",
    telephone: "010-2840-5951",
    address: {
      "@type": "PostalAddress",
      addressLocality: "서울특별시 관악구",
      addressCountry: "KR",
    },
    sameAs: [],
    knowsAbout: [
      "편집 디자인",
      "출판 디자인",
      "포스터 디자인",
      "비주얼 그래픽",
      "디지털 콘텐츠 디자인",
      "브랜드 디자인",
      "패키지 디자인",
    ],
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#FEFBF9] antialiased touch-pan-y">{children}</body>
    </html>
  );
}

