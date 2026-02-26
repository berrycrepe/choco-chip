import type { ClassGroup, ClassProblem } from "@/lib/types";

function makeProblems(level: number, startId: number, titles: string[]): ClassProblem[] {
  return titles.map((title, index) => ({
    id: startId + index,
    title,
    tier: level,
    classLevel: level,
    essential: index < Math.ceil(titles.length / 2),
  }));
}

const classes: Array<{ level: number; startId: number; titles: string[] }> = [
  { level: 1, startId: 1000, titles: ["A+B", "A-B", "Hello World", "고양이", "개", "사칙연산", "AxB", "윤년"] },
  { level: 2, startId: 2000, titles: ["스택", "큐", "괄호", "ACM 호텔", "좌표 정렬하기", "요세푸스 문제 0", "수 찾기", "카드2"] },
  { level: 3, startId: 3000, titles: ["피보나치 함수", "2xn 타일링", "1로 만들기", "Four Squares", "거스름돈", "정수 삼각형", "계단 오르기", "1,2,3 더하기"] },
  { level: 4, startId: 4000, titles: ["DFS와 BFS", "미로 탐색", "숨바꼭질", "바이러스", "단지번호붙이기", "나이트의 이동", "토마토", "A -> B"] },
  { level: 5, startId: 5000, titles: ["동전 0", "ATM", "잃어버린 괄호", "보석 도둑", "주유소", "멀티탭 스케줄링", "수 묶기", "저울"] },
  { level: 6, startId: 6000, titles: ["최단 경로", "플로이드", "다익스트라", "벨만-포드", "0-1 BFS", "K번째 최단경로", "특정 거리", "그래프 순회 심화"] },
  { level: 7, startId: 7000, titles: ["세그먼트 트리", "펜윅 트리", "구간 합", "lazy propagation", "RMQ", "오프라인 쿼리", "Mo's Algorithm", "Sparse Table"] },
  { level: 8, startId: 8000, titles: ["유니온 파인드 심화", "MST", "LCA", "HLD", "Euler Tour", "SCC", "2-SAT", "위상정렬 심화"] },
  { level: 9, startId: 9000, titles: ["Convex Hull", "Rotating Calipers", "Line Sweep", "Half Plane", "Dynamic Connectivity", "Centroid Decomposition", "Min-Cost Max-Flow", "String Automaton"] },
  { level: 10, startId: 10000, titles: ["FFT", "NTT", "Polynomial", "Suffix Array", "Link-Cut Tree", "Persistent Segment Tree", "Dinic 심화", "Geometry Advanced"] },
];

export const classGroups: ClassGroup[] = classes.map((group) => ({
  level: group.level,
  title: `CLASS ${group.level}`,
  problems: makeProblems(group.level, group.startId, group.titles),
  baseRequired: Math.ceil(group.titles.length / 2),
}));
