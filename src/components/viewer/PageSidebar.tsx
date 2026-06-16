"use client";

import clsx from "clsx";
import { Building2 } from "lucide-react";
import { PageIndexItem } from "@/data/pageIndex";

type Props = {
  pages: PageIndexItem[];
  selectedPageId: string;
  onSelectPage: (pageId: string) => void;
};

export function PageSidebar({ pages, selectedPageId, onSelectPage }: Props) {
  return (
    <aside className="pageSidebar">
      <div className="brand">
        <Building2 size={20} aria-hidden="true" />
        <div>
          <strong>강서구 통합신청사</strong>
          <span>3D 사무공간 뷰어</span>
        </div>
      </div>
      <nav className="pageList" aria-label="평면도 페이지">
        {pages.map((page) => (
          <button
            key={page.id}
            className={clsx("pageButton", page.id === selectedPageId && "isActive")}
            onClick={() => onSelectPage(page.id)}
            type="button"
          >
            <span>{String(page.pageNumber).padStart(2, "0")}</span>
            <strong>{page.title}</strong>
          </button>
        ))}
      </nav>
    </aside>
  );
}
