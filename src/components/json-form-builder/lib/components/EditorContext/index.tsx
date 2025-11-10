import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  KeyboardSensor,
  DragOverlay,
  UniqueIdentifier,
  useSensor,
  useSensors,
  Active,
  pointerWithin,
} from "@dnd-kit/core";
import { useEffect, useRef, useState, useCallback } from "react";
import { CustomJsonSchema, CustomLayoutType, useJSONBuilderContext } from "../../context/dnd-context";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { Item } from "../../types/dnd-types";
import JsonBuilderContext from "../JsonBuilderContextWrapper";
import { convertSchemas } from "../../utils/util-function";
import { JsonSchema, UISchemaElement } from "@jsonforms/core";
import isEqual from "lodash/isEqual"; 

interface OverlayComponentType {
  active: Active;
}

interface OnChangeSchemaFunctionParams {
  schema: JsonSchema;
  uischema: CustomLayoutType;
}

interface EditorContextProp extends React.PropsWithChildren {
  initialData?: { schema: CustomJsonSchema; uischema: CustomLayoutType };
  renderOverlay?: (props: OverlayComponentType) => React.ReactNode;
  onChange?: (data: OnChangeSchemaFunctionParams) => void;
}

function Component({
  children,
  renderOverlay,
  onChange,
  initialData,
}: EditorContextProp) {
  const [isInitialized, setInitialized] = useState(false);
  const {
    uiSchema,
    jsonSchema,
    active,
    setActive,
    items,
    setItems,
    setSelectedItem,
    clonedItems,
    setClonedItems,
    setSidebardKey,
    setFormProperties
  } = useJSONBuilderContext();

  // Store pending updates in a ref to avoid redundant state changes
  const pendingItemsUpdateRef = useRef<Item[] | null>(null);
  const lastDragOverTime = useRef(0);
  const recentlyMovedToNewContainer = useRef(false);
  const dragUpdateTimeoutRef = useRef<number | null>(null);
  // Handle schema changes with debouncing
  const prevSchemaRef = useRef<JsonSchema | null>(null);
  const prevUiSchemaRef = useRef<UISchemaElement | null>(null);

  useEffect(() => {
    if (initialData?.schema && initialData.uischema) {
      const initialItems = convertSchemas(initialData?.schema, {
        elements: [initialData.uischema],
        type: "",
      });
      setFormProperties(initialData?.uischema?.properties);
      setItems(initialItems);
    }
  }, [initialData]);

  const sensors = useSensors(
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isInitialized) {
      setInitialized(true);
      // Initialize refs with current values.
      prevSchemaRef.current = jsonSchema as JsonSchema;
      prevUiSchemaRef.current = uiSchema;
      return;
    }

    const timeoutId = setTimeout(() => {
      // Only call onChange if either schema has changed.
      if (
        !isEqual(prevSchemaRef.current, jsonSchema) ||
        !isEqual(prevUiSchemaRef.current, uiSchema)
      ) {
        console.log("Invoked onChange");
        onChange?.({ schema: jsonSchema as JsonSchema, uischema: uiSchema });
        prevSchemaRef.current = jsonSchema as JsonSchema;
        prevUiSchemaRef.current = uiSchema;
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [jsonSchema, uiSchema, isInitialized, onChange]);

  // Reset container moved flag with proper cleanup
  useEffect(() => {
    if (recentlyMovedToNewContainer.current) {
      const frameId = requestAnimationFrame(() => {
        recentlyMovedToNewContainer.current = false;
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [items]);

  // Apply pending updates to items
  useEffect(() => {
    // Function to update items with pending changes
    const applyPendingUpdates = () => {
      if (pendingItemsUpdateRef.current !== null) {
        setItems(pendingItemsUpdateRef.current);
        pendingItemsUpdateRef.current = null;
      }
    };

    // Cleanup function to ensure we don't have lingering timeouts
    return () => {
      if (dragUpdateTimeoutRef.current !== null) {
        window.clearTimeout(dragUpdateTimeoutRef.current);
        dragUpdateTimeoutRef.current = null;
      }
    };
  }, [setItems]);

  const findItem = useCallback(
    (id: UniqueIdentifier, localItems: Item[] = items): Item | undefined => {
      return localItems.find((item) => item.id === id);
    },
    [items]
  );

  const findItemIndex = useCallback(
    (id: UniqueIdentifier, localItems: Item[] = items): number => {
      return localItems.findIndex((item) => item.id === id);
    },
    [items]
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActive(active);
    const activeItem = findItem(active.id);
    if (activeItem) setSelectedItem(activeItem);
    setClonedItems(items);
  }, [findItem, items, setActive, setClonedItems, setSelectedItem]);

  const filterUniqueObjects = useCallback((arr: Item[]): Item[] => {
    const seenIds = new Set();
    return arr.filter((obj) => {
      if (!seenIds.has(obj.id)) {
        seenIds.add(obj.id);
        return true;
      }
      return false;
    });
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    const overId = over?.id;

    // Clear any pending updates from drag over events
    if (dragUpdateTimeoutRef.current !== null) {
      window.clearTimeout(dragUpdateTimeoutRef.current);
      dragUpdateTimeoutRef.current = null;
    }

    // Apply any pending item updates immediately
    if (pendingItemsUpdateRef.current !== null) {
      setItems(pendingItemsUpdateRef.current);
      pendingItemsUpdateRef.current = null;
    }

    if (overId == null) {
      setActive(undefined);
      return;
    }

    const activeIndex = findItemIndex(active.id);
    const overIndex = findItemIndex(overId);

    if (activeIndex !== overIndex) {
      setItems((items) => arrayMove(items, activeIndex, overIndex));
    }

    setActive(undefined);
    setSidebardKey(Date.now());
  }, [findItemIndex, setActive, setItems, setSidebardKey]);

  const onDragCancel = useCallback(() => {
    // Clear any pending updates
    if (dragUpdateTimeoutRef.current !== null) {
      window.clearTimeout(dragUpdateTimeoutRef.current);
      dragUpdateTimeoutRef.current = null;
    }
    pendingItemsUpdateRef.current = null;

    if (clonedItems) {
      setItems(clonedItems);
    }
    setActive(undefined);
    setClonedItems(undefined);
  }, [clonedItems, setActive, setClonedItems, setItems]);

  // Improved circular reference check with iterative approach
  const wouldCreateCircularReference = useCallback(
    (childId: UniqueIdentifier, potentialParentId: UniqueIdentifier, localItems: Item[] = items): boolean => {
      if (childId === potentialParentId) return true;

      let currentId = potentialParentId;
      const visited = new Set<UniqueIdentifier>();

      // Check ancestor chain with a maximum depth limit
      const MAX_DEPTH = 100;
      let depth = 0;

      while (currentId && depth < MAX_DEPTH) {
        if (visited.has(currentId)) return true; // Existing circular reference
        visited.add(currentId);

        if (currentId === childId) return true;

        const parentItem = findItem(currentId, localItems);
        if (!parentItem || !parentItem.parentId) break;

        currentId = parentItem.parentId;
        depth++;
      }

      return false;
    },
    [findItem, items]
  );

  // Properly throttled drag over handler to prevent excessive updates
  const handleDragOver = useCallback(
    ({ over }: DragMoveEvent) => {
      if (!active || !over?.id) return;

      // Throttle updates to prevent excessive state changes
      const now = Date.now();
      if (now - lastDragOverTime.current < 150) { // Increased throttle time
        return; // Skip this update if less than 150ms since last update
      }

      lastDragOverTime.current = now;

      // Clear previous timeout if it exists
      if (dragUpdateTimeoutRef.current !== null) {
        window.clearTimeout(dragUpdateTimeoutRef.current);
      }

      // Work with the most up-to-date items (either pending or current)
      const localItems = pendingItemsUpdateRef.current || [...items];
      const overId = over.id;
      const overItem = findItem(overId, localItems);
      const activeItem = findItem(active.id, localItems);

      // Case 1: Adding a new item to the container (from palette)
      if (!activeItem) {
        const parentId = overItem?.isLayoutElement ? overItem.id : overItem?.parentId || over.id;
        const newItem = {
          ...active.data.current,
          fromPallete: false,
          parentId,
        } as unknown as Item;

        // Store update in ref instead of immediately updating state
        pendingItemsUpdateRef.current = [...localItems, newItem];
      } else {
        // Skip if dragging over self
        if (overItem?.id === activeItem.id) return;

        // Determine the target container
        const targetContainerId = overItem
          ? (overItem.isLayoutElement ? overItem.id : overItem.parentId)
          : over.id;

        // Prevent circular references
        if (activeItem.isLayoutElement && wouldCreateCircularReference(activeItem.id, targetContainerId, localItems)) {
          return;
        }

        // Update the item's parent
        let updatedItems = localItems.map(item =>
          item.id === activeItem.id ? { ...item, parentId: targetContainerId } : item
        );

        // Handle repositioning within container
        if (overItem) {
          const overIndex = findItemIndex(overId, updatedItems);
          const activeIndex = findItemIndex(active.id, updatedItems);

          if (activeIndex !== overIndex) {
            updatedItems = arrayMove(updatedItems, activeIndex, overIndex);
          }
        }

        // Remove any duplicates
        updatedItems = filterUniqueObjects(updatedItems);

        // Store update in ref instead of immediately updating state
        pendingItemsUpdateRef.current = updatedItems;
      }

      // Schedule a single update with the latest changes
      dragUpdateTimeoutRef.current = window.setTimeout(() => {
        if (pendingItemsUpdateRef.current) {
          setItems(pendingItemsUpdateRef.current);
          pendingItemsUpdateRef.current = null;
          recentlyMovedToNewContainer.current = true;
          dragUpdateTimeoutRef.current = null;
        }
      }, 50);
    },
    [
      active,
      items,
      findItem,
      findItemIndex,
      filterUniqueObjects,
      setItems,
      wouldCreateCircularReference
    ]
  );

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={onDragCancel}
      modifiers={[snapCenterToCursor]}
    >
      {children}
      <DragOverlay
        className="dnd-drag-overlay"
        style={{ zIndex: 9999999 }}
        zIndex={1600}
        dropAnimation={null}
      >
        {active &&
          active?.id &&
          (renderOverlay ? (
            renderOverlay({ active })
          ) : (
            <p>
              {active?.data?.current?.isLayoutElement
                ? active.data.current?.title
                : active.data.current?.title}
            </p>
          ))}
      </DragOverlay>
    </DndContext>
  );
}

const EditorContext = (props: EditorContextProp) => (
  <JsonBuilderContext>
    <Component {...props} />
  </JsonBuilderContext>
);

export default EditorContext;