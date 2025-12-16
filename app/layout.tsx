import type { Metadata } from "next";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "김민지 포트폴리오",
  description: "보이는 결과뿐 아니라, 소통의 과정도 함께하는 디자이너 김민지입니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[#FEFBF9] antialiased">{children}</body>
    </html>
  );
}

