import React, {useCallback, useRef, useState, useContext} from 'react';
import {ViewStyle} from 'react-native';
import {
  LongPressGestureHandler,
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  WithSpringConfig,
  withTiming,
} from 'react-native-reanimated';
import Styles from './styles';
import AppContext from '../../context/AppContext';
import {PlayerItem} from '../../context/AppContext';
import AddButton from '../AddButton';

type Props = {
  index: number;
  order: SharedValue<number[]>;
  initialOrder: number[];
  data: SharedValue<PlayerItem[]>;
  itemWidth: number;
  itemHeight: number;
  margin: number;
  numPerRow: number;
  offsetX: number;
  offsetY: number;
  scrollRef: React.MutableRefObject<Animated.ScrollView | null>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  cancelEditing: () => void;
  renderItem: () => JSX.Element;
  deleteRenderItem: () => JSX.Element;
  openFolder: (folderData: PlayerItem) => void;
  onClose: (x: number, y: number) => void;
  deleteStyle?: ViewStyle;
  activeItemIndex: SharedValue<number>;
  parentWidth: number;
  parentHeight: number;
  display: SharedValue<string>;
  folderIndex?: number;
  isOutside: boolean;
  setIsOutside: React.Dispatch<React.SetStateAction<boolean>>;
  isFolderGrid: boolean;
};

const springConfig: WithSpringConfig = {
  damping: 15,
};

const LONG_PRESS_DURATION = 300;

function DraggableItem({
  index,
  order,
  initialOrder, //unused
  data,
  itemWidth,
  itemHeight,
  margin,
  numPerRow,
  offsetX,
  offsetY,
  scrollRef,
  isEditing,
  openFolder,
  onClose,
  setIsEditing,
  setScrollEnabled,
  cancelEditing,
  renderItem,
  deleteRenderItem,
  deleteStyle,
  activeItemIndex,
  parentHeight,
  folderIndex, //unused
  isOutside,
  setIsOutside,
  isFolderGrid,
}: Props) {
  const {draggedCoordinates, addToMainGrid} = useContext(AppContext);

  const isHeld = useSharedValue(false);
  const isMoving = useSharedValue(false);
  const scale = useSharedValue(1);
  const scaleHovered = useSharedValue(1);
  const rotation = useSharedValue(0);
  const deleteScale = useSharedValue(0);

  const [draggedId, setDraggedId] = useState(-1);

  const panRef = useRef(null);
  const longPressRef = useRef(null);

  function getPositionFromOrder() {
    'worklet';

    const orderPosition = order.value.findIndex(item => item === index);

    const col = orderPosition % numPerRow;
    const row = Math.floor(orderPosition / numPerRow);

    const x = offsetX + (itemWidth + 2 * margin) * col + margin;
    const y = offsetY + (itemHeight + 2 * margin) * row + margin;
    return {x, y};
  }

  const activeX = useSharedValue(getPositionFromOrder().x);
  const activeY = useSharedValue(getPositionFromOrder().y);

  function clamp(value: number, min: number, max: number) {
    'worklet';

    return Math.min(Math.max(value, min), max);
  }
  function getOrderFromPosition(
    newX: number,
    newY: number,
    translationX: number,
    translationY: number,
  ) {
    'worklet';

    const rightX = newX + itemWidth;
    const leftX = newX;
    const topY = newY;
    const bottomY = newY + itemHeight;
    const centerX = newX + itemWidth / 2;
    const centerY = newY + itemHeight / 2;

    let col;
    let row;

    const centerCol = Math.floor(
      (centerX - offsetX) / (itemWidth + 2 * margin),
    );
    const centerRow = Math.floor(
      (centerY - offsetY) / (itemHeight + 2 * margin),
    );

    if (translationX < 0) {
      col = Math.floor((rightX + 5 - offsetX) / (itemWidth + 2 * margin));
    } else {
      col = Math.floor((leftX - 5 - offsetX) / (itemWidth + 2 * margin));
    }
    if (translationY < 0) {
      row = Math.floor((bottomY + 5 - offsetY) / (itemHeight + 2 * margin));
    } else {
      row = Math.floor((topY - 5 - offsetY) / (itemHeight + 2 * margin));
    }

    const clampedCol = clamp(col, 0, numPerRow);
    const clampedRow = clamp(
      row,
      0,
      Math.floor((order.value.length - 1) / numPerRow),
    );

    const clampedColCenter = clamp(centerCol, 0, numPerRow);
    const clampedRowCenter = clamp(
      centerRow,
      0,
      Math.floor((order.value.length - 1) / numPerRow),
    );

    return {
      col: clampedCol,
      row: clampedRow,
      colCenter: clampedColCenter,
      rowCenter: clampedRowCenter,
    };
  }

  function getOrderPositionFromRowCol(row: number, col: number) {
    'worklet';

    const newOrderPosition = row * numPerRow + col;
    return clamp(newOrderPosition, 0, order.value.length);
  }

  function rearrangeOrder(newOrderPosition: number) {
    'worklet';

    if (!isOutside) {
      const newOrder = order.value.filter(orderIndex => orderIndex !== index);

      newOrder.splice(newOrderPosition, 0, index);

      order.value = newOrder;
    }
  }

  function handleRearrange(
    newX: number,
    newY: number,
    translationX: number,
    translationY: number,
  ) {
    'worklet';

    const {col, row, colCenter, rowCenter} = getOrderFromPosition(
      newX,
      newY,
      translationX,
      translationY,
    );
    const newOrderPosition = getOrderPositionFromRowCol(row, col);

    if (colCenter !== col || rowCenter !== row) {
      const indexToSwap = rowCenter * numPerRow + colCenter;
      const indexToSwapOrder = order.value[indexToSwap];
      activeItemIndex.value = indexToSwapOrder;
    } else {
      activeItemIndex.value = -1;
      rearrangeOrder(newOrderPosition);
    }
  }

  function updateOrderAfterRemoval(removedIndex: number) {
    'worklet';

    const newOrder = order.value.filter(
      orderIndex => orderIndex !== removedIndex,
    );

    order.value = newOrder;
  }

  function moveToFolder() {
    'worklet';

    if (
      index === activeItemIndex.value ||
      activeItemIndex.value === undefined
    ) {
      return;
    }
    const updatedData = data.value.map(item => {
      if (item.index === activeItemIndex.value) {
        return {
          ...item,
          name: item.isFolder ? item.name : 'Nowy folder',
          isFolder: item.isFolder ? item.isFolder : true,
          nestedPlayers: item.nestedPlayers
            ? [
                ...item.nestedPlayers,
                data.value.find(item => item.index === index),
              ]
            : [
                data.value.find(item => item.index === activeItemIndex.value),
                data.value.find(item => item.index === index),
              ],
          folderOrder: item.folderOrder
            ? [...item.folderOrder, index]
            : [index],
        };
      }
      return item;
    });

    const filteredData = updatedData.filter(item => item.index !== index);

    updateOrderAfterRemoval(index);

    data.value = filteredData;
  }

  function justDeleteItem() {
    'worklet';

    const newData = data.value.filter(item => item.index !== index);

    updateOrderAfterRemoval(index);

    data.value = newData;
  }

  function holdAnimation(value: number) {
    'worklet';

    return withDelay(
      200,
      withTiming(value, {
        duration: LONG_PRESS_DURATION - 200,
        easing: Easing.inOut(Easing.quad),
      }),
    );
  }

  function releaseAnimation(value: number) {
    'worklet';

    return withTiming(value, {
      duration: LONG_PRESS_DURATION,
      easing: Easing.inOut(Easing.quad),
    });
  }

  const eventHandler = useAnimatedGestureHandler({
    onStart: (event, ctx) => {
      ctx.startX = activeX.value;
      ctx.startY = activeY.value;

      runOnJS(setDraggedId)(index);
    },
    onActive: (event, ctx) => {
      if (isHeld.value) {
        isMoving.value = true;
        const newX = ctx.startX + event.translationX;
        const newY = ctx.startY + event.translationY;

        const translationX = event.translationX;
        const translationY = event.translationY;

        console.log('draggedId: ', draggedId);

        if (isFolderGrid === true) {
          if (newY < 0 - itemHeight || newY > parentHeight - 60) {
            runOnJS(setIsOutside)(true);

            if (isOutside) {
              // scale.value = withSpring(0.8, {damping: 12, mass: 1});
              draggedCoordinates.value = {
                x: event.absoluteX,
                y: event.absoluteY,
              };

              // runOnJS(onClose)(event.absoluteX, event.absoluteY);
              // runOnJS(setDraggedItem)(
              //   data.value.find(item => item.index === index),
              // );

              // runOnJS(setContextOrder)([...contextOrder, index]);
              // runOnJS(setDummyData)([
              //   ...dummyData,
              //   data.value.find(item => item.index === index),
              // ]);
              // justDeleteItem();
            }
          } else {
            runOnJS(setIsOutside)(false);
            scale.value = withSpring(1, {damping: 12, mass: 1});
          }
        }

        activeX.value = newX;
        activeY.value = newY;

        handleRearrange(newX, newY, translationX, translationY);
      }
    },
    onEnd: (event, ctx) => {
      scale.value = releaseAnimation(1);
      if (isHeld.value) {
        const newX = ctx.startX + event.translationX;
        const newY = ctx.startY + event.translationY;

        const translationX = event.translationX;
        const translationY = event.translationY;

        activeX.value = newX;
        activeY.value = newY;

        if (activeItemIndex.value !== -1 && !isOutside) {
          moveToFolder();
        }

        if (isOutside) {
          console.log(
            'usuwam: ',
            data.value.find(item => item.index === index),
          );

          console.log(data.value.find(item => item.index === index));
          runOnJS(addToMainGrid)(data.value.find(item => item.index === index));
          justDeleteItem();
          runOnJS(onClose)(event.absoluteX, event.absoluteY);
        }

        handleRearrange(newX, newY, translationX, translationY);
      }

      runOnJS(setDraggedId)(-1);
      runOnJS(setScrollEnabled)(true);
      isHeld.value = false;
      isMoving.value = false;
    },
  });

  function handleReposition() {
    'worklet';

    const {x, y} = getPositionFromOrder(); // TODO: Might need to pass order as a param
    activeX.value = withSpring(x, springConfig);
    activeY.value = withSpring(y, springConfig);
  }

  useAnimatedReaction(
    () => activeItemIndex.value,
    activeIndex => {
      scaleHovered.value = withTiming(activeIndex === index ? 1.1 : 1, {
        duration: 300,
        easing: Easing.inOut(Easing.quad),
      });
    },
  );

  useAnimatedReaction(
    () => JSON.stringify(order.value),
    (result, previous) => {
      if (result !== previous && !isHeld.value) {
        handleReposition();
      }
    },
  );

  useAnimatedReaction(
    () => isHeld.value,
    (result, previous) => {
      if (result !== previous) {
        handleReposition();
      }
    },
  );

  useAnimatedReaction(
    () => isEditing,
    (result, previous) => {
      const cycleTime = 150;
      const distance = 1.5;
      if (result && !previous) {
        rotation.value = withSequence(
          withTiming(-distance, {duration: cycleTime / 2}),
          withRepeat(withTiming(distance, {duration: cycleTime}), 0, true),
        );
        deleteScale.value = withSpring(1, {damping: 12, mass: 1});
      } else if (!result && previous) {
        rotation.value = withTiming(0, {duration: cycleTime / 2});
        deleteScale.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      }
    },
  );

  const triggerHapticFeedback = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactMedium');
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const isHovered = activeItemIndex.value === index;
    return {
      transform: [
        {
          translateX: activeX.value,
        },
        {
          translateY: activeY.value,
        },
        {
          scale: isHovered ? scale.value * scaleHovered.value : scale.value,
        },
        {
          rotateZ: `${rotation.value}deg`,
        },
      ],
      zIndex: isHeld.value ? 99 : 0,
    };
  });

  const deleteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: deleteScale.value,
      },
    ],
  }));

  if (isOutside && draggedId !== index) {
    return null;
  }

  return (
    <PanGestureHandler
      simultaneousHandlers={[scrollRef, longPressRef]}
      ref={panRef}
      onGestureEvent={eventHandler}>
      <Styles.AnimatedView
        style={[{width: itemWidth, height: itemHeight}, animatedStyle]}>
        <LongPressGestureHandler
          maxDist={20}
          minDurationMs={LONG_PRESS_DURATION}
          onBegan={() => {
            scale.value = holdAnimation(1.05);
          }}
          onFailed={() => {
            scale.value = releaseAnimation(1);
          }}
          onActivated={() => {
            triggerHapticFeedback();
            setIsEditing(true);
            setScrollEnabled(false);
            isHeld.value = true;
          }}
          onEnded={() => {
            if (!isMoving.value) {
              isHeld.value = false;
            }
            activeItemIndex.value = -1;
            scale.value = releaseAnimation(1);
          }}
          ref={longPressRef}
          simultaneousHandlers={[scrollRef, panRef]}>
          <TapGestureHandler
            onHandlerStateChange={e => {
              const currentItem = data.value.find(item => item.index === index);
              if (
                e.nativeEvent.state === State.END &&
                currentItem &&
                currentItem.isFolder
              ) {
                openFolder(currentItem);
              }
            }}>
            <Styles.InnerAnimatedView
              style={{
                width: itemWidth,
                height: itemHeight,
              }}>
              <Styles.Content>{renderItem()}</Styles.Content>
              {isEditing ? (
                <Styles.CancelPressable onPress={cancelEditing} />
              ) : null}
            </Styles.InnerAnimatedView>
          </TapGestureHandler>
        </LongPressGestureHandler>
        <Styles.AnimatedDeleteView style={[deleteStyle, deleteAnimatedStyle]}>
          {isOutside ? <AddButton size={32} /> : deleteRenderItem()}
        </Styles.AnimatedDeleteView>
      </Styles.AnimatedView>
    </PanGestureHandler>
  );
}

export default DraggableItem;
