import React, {useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {Portal} from 'react-native-portalize';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import DeleteButton from '../DeleteButton/DeleteButton';
import Tile from '../Tile/Tile';
import {TextInput} from 'react-native-gesture-handler';
import FolderGrid from '../FolderGrid';

const {width} = Dimensions.get('window');

const margin = 8;
const padding = 10;
const folderViewContainerWidth = width - margin * 2;
const itemWidth = folderViewContainerWidth / 3 - padding * 2;
const folderViewContainerHeight = itemWidth * 3 + margin * 10 + padding * 2;
const itemHeight = itemWidth;
const deleteSize = 30;

type Props = {
  onClose: () => void;
  openFolder: (folderData: any) => void;
  setDummyData: (newData: any[]) => void;
  data: any;
  folderData: any;
};

function FolderView({
  onClose,
  openFolder,
  setDummyData,
  data,
  folderData,
}: Props) {
  const [order, setOrder] = useState(
    data.find(item => item.index === folderData.index)?.folderOrder || [],
  );
  const display = useSharedValue('flex');

  const deleteFromFolder = (index: number) => {
    const newData = data.map(item => {
      if (item.index === folderData.index) {
        return {
          ...item,
          folderOrder: item.folderOrder.filter(value => value !== index),
          nestedPlayers: item.nestedPlayers.filter(
            value => value.index !== index,
          ),
        };
      }
    });
    setDummyData(newData);
  };

  const onFolderOrderChange = (newOrder: number[]) => {
    const newData = data.map(item => {
      if (item.index === folderData.index) {
        return {...item, folderOrder: newOrder};
      }
      return item;
    });
    setDummyData(newData);
  };

  const onFolderDataChange = (newData: any[]) => {
    const updatedData = data.map(item => {
      if (item.index === folderData.index) {
        return {...item, nestedPlayers: newData};
      }
      return item;
    });
    setDummyData(updatedData);
  };

  const handleDelete = (index: number) => {
    const newOrder = order.filter(value => value !== index);
    setOrder(newOrder);
    const newData = data.map(item => {
      if (item.index === folderData.index) {
        return {
          ...item,
          nestedPlayers: item.nestedPlayers.filter(
            value => value.index !== index,
          ),
        };
      }
      return item;
    });
    setDummyData(newData);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      display: display.value,
    };
  });

  return (
    <View>
      <Portal>
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={animatedStyle}>
          <BlurView
            {...(Platform.OS === 'ios' && {blurType: 'light'})}
            style={[s.portalContainer]}>
            <TouchableOpacity
              style={{
                ...StyleSheet.absoluteFillObject,
              }}
              onPress={() => {
                onClose();
              }}
            />
            <View style={s.folderNameContainer}>
              <TextInput style={s.folderName}>{folderData.name}</TextInput>
            </View>
            <Animated.View style={[s.folderViewContainer]}>
              <FolderGrid<TileType>
                isFolderGrid={true}
                display={display}
                data={folderData.nestedPlayers}
                openFolder={openFolder}
                onClose={onClose}
                handleDelete={deleteFromFolder}
                initialOrder={order}
                renderItem={item => (
                  <Tile width={itemWidth} height={itemHeight} item={item} />
                )}
                deleteRenderItem={item => (
                  <DeleteButton
                    size={deleteSize}
                    onPress={() => handleDelete(item.index)}
                  />
                )}
                deleteStyle={{left: -deleteSize / 3, top: -deleteSize / 2}}
                onOrderingFinished={newOrder => onFolderOrderChange(newOrder)}
                onChangeDataFinished={newData => onFolderDataChange(newData)}
                itemWidth={itemWidth}
                parentWidth={folderViewContainerWidth}
                parentHeight={folderViewContainerHeight}
                itemHeight={itemHeight}
                itemMargin={margin}
                offsetY={margin}
                folderIndex={folderData.index}
              />
            </Animated.View>
          </BlurView>
        </Animated.View>
      </Portal>
    </View>
  );
}

export default FolderView;

const s = StyleSheet.create({
  portalContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  folderViewContainer: {
    backgroundColor: 'rgba(27,27,27,0.5)',
    borderRadius: 30,
    width: folderViewContainerWidth,
    height: folderViewContainerHeight,
    paddingBottom: 10,
  },
  folderNameContainer: {
    marginBottom: 75,
  },
  folderName: {
    fontSize: 24,
    color: 'black',
  },
});
