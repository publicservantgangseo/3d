"use client";

import clsx from "clsx";
import { PageIndexItem } from "@/data/pageIndex";

type Props = {
  pages: PageIndexItem[];
  selectedPageId: string;
  onSelectPage: (pageId: string) => void;
};

export function PageSidebar({ pages, selectedPageId, onSelectPage }: Props) {
  return (
    <aside className="pageRail" aria-label="Page navigation">
      <div className="pageRailTrack">
        {pages.map((page) => {
          const active = page.id === selectedPageId;
          return (
            <button
              key={page.id}
              aria-current={active ? "page" : undefined}
              aria-label={`Page ${page.pageNumber}`}
              className={clsx("pageDot", active && "isActive")}
              onClick={() => onSelectPage(page.id)}
              type="button"
            >
              <span aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
