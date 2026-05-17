import { TreeNodeUnit } from "@/components/tree/TreeNodeUnit";
import { computeTreeLayout } from "@/components/tree/computeTreeLayout";
import { colors } from "@/constants/theme";
import { Person, Relationship } from "@/types";
import {
  AdjacencyLists,
  buildAdjacencyLists,
  findDefaultRootId,
  TreeFilterOptions,
} from "@/utils/treeHelpers";
import { treeColors } from "@/utils/styleHelpers";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Line } from "react-native-svg";
import { TIMING_FAST } from "@/constants/animation";

const TREE_TOP_PADDING = 16;

function computeHomeOffset(
  viewportW: number,
  layoutW: number,
): { x: number; y: number } {
  return {
    x: (viewportW - layoutW) / 2,
    y: TREE_TOP_PADDING,
  };
}

const DEFAULT_FILTERS: TreeFilterOptions = {
  hideDaughtersInLaw: false,
  hideSonsInLaw: false,
  hideDaughters: false,
  hideSons: false,
  hideMales: false,
  hideFemales: false,
};

export function FamilyTreeView({
  persons,
  relationships,
}: {
  persons: Person[];
  relationships: Relationship[];
}) {
  const [rootId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showAvatar, setShowAvatar] = useState(true);

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const homeOffset = useRef({ x: 0, y: TREE_TOP_PADDING });

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(TREE_TOP_PADDING);
  const savedScale = useSharedValue(1);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(TREE_TOP_PADDING);

  const personsMap = useMemo(() => {
    const m = new Map<string, Person>();
    persons.forEach((p) => m.set(p.id, p));
    return m;
  }, [persons]);

  const adj: AdjacencyLists = useMemo(
    () => buildAdjacencyLists(relationships, personsMap),
    [relationships, personsMap],
  );

  const effectiveRootId = useMemo(() => {
    if (rootId && personsMap.has(rootId)) return rootId;
    return findDefaultRootId(persons, relationships);
  }, [rootId, persons, relationships, personsMap]);

  const layout = useMemo(() => {
    if (!effectiveRootId) return null;
    return computeTreeLayout(
      effectiveRootId,
      personsMap,
      adj,
      DEFAULT_FILTERS,
      collapsed,
      showAvatar,
    );
  }, [effectiveRootId, personsMap, adj, collapsed, showAvatar]);

  const applyHomeOffset = useCallback(() => {
    if (!layout || viewport.w === 0) return;
    const offset = computeHomeOffset(viewport.w, layout.width);
    homeOffset.current = offset;
    translateX.value = offset.x;
    translateY.value = offset.y;
    savedTX.value = offset.x;
    savedTY.value = offset.y;
    scale.value = 1;
    savedScale.value = 1;
  }, [layout, viewport.w, translateX, translateY, savedTX, savedTY, scale, savedScale]);

  useEffect(() => {
    applyHomeOffset();
  }, [applyHomeOffset]);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(2.5, Math.max(0.35, savedScale.value * e.scale));
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedTX.value + e.translationX;
      translateY.value = savedTY.value + e.translationY;
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const zoomIn = () => {
    scale.value = withTiming(Math.min(2.5, scale.value + 0.15), TIMING_FAST);
  };
  const zoomOut = () => {
    scale.value = withTiming(Math.max(0.35, scale.value - 0.15), TIMING_FAST);
  };
  const resetView = () => {
    const { x, y } = homeOffset.current;
    scale.value = withTiming(1, TIMING_FAST);
    translateX.value = withTiming(x, TIMING_FAST);
    translateY.value = withTiming(y, TIMING_FAST);
    savedScale.value = 1;
    savedTX.value = x;
    savedTY.value = y;
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!persons.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Chưa có thành viên trong gia phả.</Text>
      </View>
    );
  }

  if (!layout || !effectiveRootId) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <Pressable onPress={zoomIn} style={styles.toolBtn}>
          <Ionicons name="add" size={20} color={colors.text} />
        </Pressable>
        <Pressable onPress={zoomOut} style={styles.toolBtn}>
          <Ionicons name="remove" size={20} color={colors.text} />
        </Pressable>
        <Pressable onPress={resetView} style={styles.toolBtn}>
          <Ionicons name="scan-outline" size={18} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => setShowAvatar((v) => !v)}
          style={[styles.toolBtn, showAvatar && styles.toolBtnActive]}
        >
          <Ionicons name="person-circle-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View
        style={styles.viewport}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setViewport((prev) =>
            prev.w === width && prev.h === height
              ? prev
              : { w: width, h: height },
          );
        }}
      >
        <GestureDetector gesture={composed}>
          <Animated.View
            style={[
              { width: layout.width, height: layout.height },
              canvasStyle,
            ]}
            collapsable={false}
          >
            <Svg
              width={layout.width}
              height={layout.height}
              style={StyleSheet.absoluteFill}
            >
              {layout.edges.map((e, i) => (
                <Line
                  key={`e-${i}`}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke={treeColors.line}
                  strokeWidth={1.5}
                />
              ))}
            </Svg>

            {layout.units.map((unit) => (
              <View
                key={unit.key}
                style={[
                  styles.unitPos,
                  {
                    left: unit.x,
                    top: unit.y,
                    width: unit.width,
                    minHeight: unit.height,
                  },
                ]}
              >
                <TreeNodeUnit
                  person={unit.person}
                  spouses={unit.spouses}
                  showAvatar={showAvatar}
                  isFirstSpouseRing={unit.spouses.length > 0}
                  onPressPerson={(id) => router.push(`/member/${id}`)}
                />
                {unit.hasChildren && (
                  <Pressable
                    style={styles.collapseBtn}
                    onPress={() => toggleCollapse(unit.key)}
                  >
                    <Ionicons
                      name={unit.isCollapsed ? "add" : "remove"}
                      size={14}
                      color={colors.textMuted}
                    />
                  </Pressable>
                )}
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    zIndex: 10,
    elevation: 4,
  },
  viewport: {
    flex: 1,
    overflow: "hidden",
  },
  toolBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  unitPos: {
    position: "absolute",
    alignItems: "center",
  },
  collapseBtn: {
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: { color: colors.textMuted },
});
