/* eslint-disable react-hooks/exhaustive-deps */
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Dimensions, ViewStyle, View, Text, StyleSheet} from 'react-native';
import Animated, {useSharedValue} from 'react-native-reanimated';
import {compareScalarArrays} from '../../helpers/common-helpers';
import DraggableItem from '../DraggableItem';
import Styles from './styles';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Carousel from 'react-native-snap-carousel';
import {Portal} from 'react-native-portalize';

type Props<T> = {
  isFolderGrid?: boolean;
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
  display: Animated.SharedValue<string>;
  folderIndex: number;
};

function FolderGrid<T>({
  isFolderGrid,
  display,
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
  folderIndex,
}: Props<T>) {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const [HEIGHT, setHEIGHT] = useState(Dimensions.get('window').height);
  const scrollRef = useRef<Animated.ScrollView | null>(null);
  const sharedOrder = useSharedValue(initialOrder);
  const activeItemIndex = useSharedValue<number>(-1);
  const sharedData = useSharedValue(data);
  const [prevOrder, setPrevOrder] = useState(sharedOrder.value);
  const [isEditing, setIsEditing] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const displayedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sharedData.value.slice(start, end);
  }, [sharedData.value, page]);

  useEffect(() => {
    sharedOrder.value = displayedData.map(item => item.index);
  }, [displayedData]);

  console.log('displayedData: ', displayedData);

  const numPages = useMemo(
    () => Math.ceil(sharedData.value.length / ITEMS_PER_PAGE),
    [sharedData.value.length],
  );

  const numPerRow = useMemo(
    () => Math.floor(parentWidth / (itemWidth + 2 * itemMargin)),
    [itemWidth],
  );

  const usableWidth = useMemo(
    () => numPerRow * (itemWidth + 2 * itemMargin),
    [itemWidth, numPerRow],
  );

  const offsetX = useMemo(() => (parentWidth - usableWidth) / 2, [usableWidth]);

  // async function updateData() {
  //   const url = `https://64b92eaf79b7c9def6c0b78b.mockapi.io/api/filesystem/folders/${folderIndex}`;
  //   const updatedData = {nestedPlayers: sharedData.value};

  //   try {
  //     const response = await fetch(url, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(updatedData),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     } else {
  //       console.log('Data successfully updated');
  //     }
  //   } catch (error) {
  //     console.log('There was a problem updating the data: ', error);
  //   }
  // }

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    // updateData();
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
    <>
      <View style={s.pageCarousel}>
        <Carousel
          ref={c => {
            this._carousel = c;
          }}
          data={Array.from({length: numPages}, (_, i) => i + 1)}
          renderItem={({item}) => (
            <View style={s.pageCarouselItem}>
              <Text>{item}</Text>
            </View>
          )}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={60}
          onSnapToItem={index => setPage(index + 1)}
        />
      </View>

      <Styles.Wrapper
        onLayout={event => setHEIGHT(event.nativeEvent.layout.height)}>
        <Styles.CancelPressable onPress={cancelEditing} />
        {displayedData.map((item, index) => (
          <DraggableItem
            key={item.index}
            index={item.index}
            order={sharedOrder}
            initialOrder={initialOrder}
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
            display={display}
            folderIndex={folderIndex}
          />
        ))}
      </Styles.Wrapper>
    </>
  );
}

export default FolderGrid;

const s = StyleSheet.create({
  pageCarousel: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  pageCarouselItem: {
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
