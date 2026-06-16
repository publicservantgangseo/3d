import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "강서구 통합신청사 3D 뷰어",
  description: "강서구 통합신청사 입주 전 공간 확인용 3D 오피스 뷰어"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
