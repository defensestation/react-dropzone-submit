import { Item, LayoutType } from "../../../../types/dnd-types";
import { DroppableLayout } from "../DroppableLayout";

export const renderLayoutElement = (item: Item) => {
    return (
      <DroppableLayout
        id={item.id.toString()}
        direction={item.direction ? item.direction : LayoutType.VERTICAL}
      />
    );
  };
  