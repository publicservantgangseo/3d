export type PageIndexItem = {
  id: string;
  pageNumber: number;
  title: string;
  scenePath: string;
};

export const pageIndex: PageIndexItem[] = [
  { id: "page-01", pageNumber: 1, title: "민원인 라운지", scenePath: "/data/scenes/page-01.json" },
  { id: "page-02", pageNumber: 2, title: "민원/세무/은행", scenePath: "/data/scenes/page-02.json" },
  { id: "page-03", pageNumber: 3, title: "구청장실/대회의실", scenePath: "/data/scenes/page-03.json" },
  { id: "page-04", pageNumber: 4, title: "업무공간 04", scenePath: "/data/scenes/page-04.json" },
  { id: "page-05", pageNumber: 5, title: "업무공간 05", scenePath: "/data/scenes/page-05.json" },
  { id: "page-06", pageNumber: 6, title: "업무공간 06", scenePath: "/data/scenes/page-06.json" },
  { id: "page-07", pageNumber: 7, title: "업무공간 07", scenePath: "/data/scenes/page-07.json" },
  { id: "page-08", pageNumber: 8, title: "식당/지원공간", scenePath: "/data/scenes/page-08.json" },
  { id: "page-09", pageNumber: 9, title: "검사/실험공간", scenePath: "/data/scenes/page-09.json" },
  { id: "page-10", pageNumber: 10, title: "진료/보건공간 10", scenePath: "/data/scenes/page-10.json" },
  { id: "page-11", pageNumber: 11, title: "보건/상담공간 11", scenePath: "/data/scenes/page-11.json" },
  { id: "page-12", pageNumber: 12, title: "보건관리/시청각실", scenePath: "/data/scenes/page-12.json" },
  { id: "page-13", pageNumber: 13, title: "의회/본회의장 13", scenePath: "/data/scenes/page-13.json" },
  { id: "page-14", pageNumber: 14, title: "위원회실 14", scenePath: "/data/scenes/page-14.json" },
  { id: "page-15", pageNumber: 15, title: "의장실/의회사무 15", scenePath: "/data/scenes/page-15.json" },
  { id: "page-16", pageNumber: 16, title: "의원실/회의실 16", scenePath: "/data/scenes/page-16.json" },
  { id: "page-17", pageNumber: 17, title: "예방접종/진료공간", scenePath: "/data/scenes/page-17.json" },
  { id: "page-18", pageNumber: 18, title: "자원봉사센터/키즈카페", scenePath: "/data/scenes/page-18.json" }
];
