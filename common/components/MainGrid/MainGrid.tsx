/* eslint-disable react-hooks/exhaustive-deps */
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Dimensions, ViewStyle} from 'react-native';
import Animated, {useSharedValue} from 'react-native-reanimated';
import {compareScalarArrays} from '../../helpers/common-helpers';
import DraggableItem from '../DraggableItem';
import Styles from './styles';

type Props<T> = {
  data: (T & {index: number | null})[];
  initialOrder: number[];
  itemWidth: number;
  parentWidth: number;
  parentHeight: number;
  itemHeight: number;
  itemMargin: number;
  offsetY: number;
  renderItem: (item: T, index: number) => JSX.Element;
  deleteRenderItem: (item: T, index: number) => JSX.Element;
  openFolder: (folderData: any) => void;
  onClose: () => void;
  deleteStyle?: ViewStyle;
  onOrderingFinished?: (newOrder: number[]) => void;
  onChangeDataFinished?: (newData: any[]) => void;
  portalOpacity: Animated.SharedValue<number>;
};

function MainGrid<T>({
  data,
  initialOrder,
  itemWidth,
  parentWidth,
  parentHeight,
  itemHeight,
  itemMargin,
  offsetY,
  renderItem,
  deleteRenderItem,
  openFolder,
  onClose,
  deleteStyle,
  onOrderingFinished = () => {},
  onChangeDataFinished = () => {},
  portalOpacity,
}: Props<T>) {
  const [HEIGHT, setHEIGHT] = useState(Dimensions.get('window').height);
  const scrollRef = useRef<Animated.ScrollView | null>(null);
  const sharedOrder = useSharedValue(initialOrder);
  const activeItemIndex = useSharedValue<number>(-1);
  const sharedData = useSharedValue(data);
  const [prevOrder, setPrevOrder] = useState(sharedOrder.value);
  const [isEditing, setIsEditing] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const numPerRow = useMemo(
    () => Math.floor(parentWidth / (itemWidth + 2 * itemMargin)),
    [itemWidth],
  );

  const usableWidth = useMemo(
    () => numPerRow * (itemWidth + 2 * itemMargin),
    [itemWidth, numPerRow],
  );

  const offsetX = useMemo(() => (parentWidth - usableWidth) / 2, [usableWidth]);

  const scrollHeight = useMemo(() => {
    const rows = Math.floor((data.length - 1) / numPerRow) + 1;
    const _scrollHeight =
      offsetY + (itemHeight + 2 * itemMargin) * rows + itemMargin;
    return Math.max(HEIGHT, _scrollHeight);
  }, [HEIGHT, data.length, numPerRow]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setScrollEnabled(true);
  }, []);

  const hasOrderChanged = useMemo(
    () => !compareScalarArrays(sharedOrder.value, prevOrder),
    [prevOrder, sharedOrder.value],
  );

  useFocusEffect(
    useCallback(() => {
      onChangeDataFinished(sharedData.value);
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      onOrderingFinished(sharedOrder.value);
    }, []),
  );

  useEffect(() => {
    if (hasOrderChanged) {
      setPrevOrder(sharedOrder.value);

      onChangeDataFinished(sharedData.value);

      onOrderingFinished(sharedOrder.value);
    }
  }, [
    hasOrderChanged,
    onOrderingFinished,
    onChangeDataFinished,
    sharedOrder.value,
    sharedData.value,
  ]);

  return (
    <Styles.Wrapper
      onLayout={event => setHEIGHT(event.nativeEvent.layout.height)}>
      <Styles.ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{height: scrollHeight}}
        ref={scrollRef}>
        <Styles.CancelPressable onPress={cancelEditing} />
        {sharedData.value.map((item, index) => (
          <DraggableItem
            key={item.index}
            index={item.index}
            order={sharedOrder}
            data={sharedData}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            margin={itemMargin}
            numPerRow={numPerRow}
            offsetX={offsetX}
            offsetY={offsetY}
            scrollRef={scrollRef}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setScrollEnabled={setScrollEnabled}
            cancelEditing={cancelEditing}
            renderItem={() => renderItem(item, index)}
            deleteRenderItem={() => deleteRenderItem(item, index)}
            deleteStyle={deleteStyle}
            activeItemIndex={activeItemIndex}
            openFolder={openFolder}
            onClose={onClose}
            parentWidth={parentWidth}
            parentHeight={parentHeight}
            portalOpacity={portalOpacity}
          />
        ))}
      </Styles.ScrollView>
    </Styles.Wrapper>
  );
}

export default MainGrid;
