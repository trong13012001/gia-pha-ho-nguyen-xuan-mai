import { Person } from "@/types";
import {
  AdjacencyLists,
  SpouseData,
  TreeFilterOptions,
  getFilteredTreeData,
} from "@/utils/treeHelpers";

const CARD_W = 88;
const CARD_H_AVATAR = 118;
const CARD_H_COMPACT = 68;
const LEVEL_GAP = 48;
const SIBLING_GAP = 20;
const PADDING = 32;

export interface TreeUnitLayout {
  key: string;
  person: Person;
  spouses: SpouseData[];
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  hasChildren: boolean;
  isCollapsed: boolean;
}

export interface TreeEdgeLayout {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TreeLayoutResult {
  units: TreeUnitLayout[];
  edges: TreeEdgeLayout[];
  width: number;
  height: number;
}

function unitWidth(spouseCount: number): number {
  return CARD_W * (1 + spouseCount);
}

interface SubtreeResult {
  width: number;
  units: TreeUnitLayout[];
  edges: TreeEdgeLayout[];
  rootCenterX: number;
}

function layoutSubtree(
  personId: string,
  level: number,
  personsMap: Map<string, Person>,
  adj: AdjacencyLists,
  filters: TreeFilterOptions,
  collapsed: Set<string>,
  showAvatar: boolean,
  visited: Set<string>,
): SubtreeResult | null {
  if (visited.has(personId)) return null;
  visited.add(personId);

  const data = getFilteredTreeData(personId, personsMap, adj, filters);
  if (!data.person) return null;

  const cardH = showAvatar ? CARD_H_AVATAR : CARD_H_COMPACT;
  const uW = unitWidth(data.spouses.length);
  const y = PADDING + level * (cardH + LEVEL_GAP);
  const isCollapsed = collapsed.has(personId);
  const showChildren = data.children.length > 0 && !isCollapsed;

  const rootUnit: TreeUnitLayout = {
    key: personId,
    person: data.person,
    spouses: data.spouses,
    x: 0,
    y,
    width: uW,
    height: cardH,
    level,
    hasChildren: data.children.length > 0,
    isCollapsed,
  };

  if (!showChildren) {
    rootUnit.x = 0;
    return {
      width: uW,
      units: [rootUnit],
      edges: [],
      rootCenterX: uW / 2,
    };
  }

  const childResults: SubtreeResult[] = [];
  for (const child of data.children) {
    const res = layoutSubtree(
      child.id,
      level + 1,
      personsMap,
      adj,
      filters,
      collapsed,
      showAvatar,
      new Set(visited),
    );
    if (res) childResults.push(res);
  }

  if (!childResults.length) {
    rootUnit.x = 0;
    return { width: uW, units: [rootUnit], edges: [], rootCenterX: uW / 2 };
  }

  const childrenTotalW =
    childResults.reduce((s, c) => s + c.width, 0) +
    SIBLING_GAP * (childResults.length - 1);
  const subtreeW = Math.max(uW, childrenTotalW);
  const childrenLeft = (subtreeW - childrenTotalW) / 2;

  rootUnit.x = subtreeW / 2 - uW / 2;

  const units: TreeUnitLayout[] = [rootUnit];
  const edges: TreeEdgeLayout[] = [];
  const parentBottomX = rootUnit.x + uW / 2;
  const parentBottomY = y + cardH;

  let offset = childrenLeft;
  for (const child of childResults) {
    const shiftX = offset;
    for (const u of child.units) {
      units.push({ ...u, x: u.x + shiftX });
    }
    edges.push(
      ...child.edges.map((e) => ({
        x1: e.x1 + shiftX,
        y1: e.y1,
        x2: e.x2 + shiftX,
        y2: e.y2,
      })),
    );
    edges.push({
      x1: parentBottomX,
      y1: parentBottomY,
      x2: shiftX + child.rootCenterX,
      y2: PADDING + (level + 1) * (cardH + LEVEL_GAP),
    });
    offset += child.width + SIBLING_GAP;
  }

  return {
    width: subtreeW,
    units,
    edges,
    rootCenterX: subtreeW / 2,
  };
}

export function computeTreeLayout(
  rootId: string,
  personsMap: Map<string, Person>,
  adj: AdjacencyLists,
  filters: TreeFilterOptions,
  collapsed: Set<string>,
  showAvatar: boolean,
): TreeLayoutResult {
  const result = layoutSubtree(
    rootId,
    0,
    personsMap,
    adj,
    filters,
    collapsed,
    showAvatar,
    new Set(),
  );

  if (!result) {
    return { units: [], edges: [], width: 320, height: 400 };
  }

  const cardH = showAvatar ? CARD_H_AVATAR : CARD_H_COMPACT;
  const maxLevel = result.units.reduce((m, u) => Math.max(m, u.level), 0);
  const height = PADDING * 2 + (maxLevel + 1) * cardH + maxLevel * LEVEL_GAP;

  return {
    units: result.units,
    edges: result.edges,
    width: Math.max(result.width + PADDING * 2, 320),
    height: Math.max(height, 400),
  };
}
