import React, {useContext, useState} from 'react';
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
} from 'react-native-reanimated';
import DeleteButton from '../DeleteButton/DeleteButton';
import Tile from '../Tile/Tile';
import {TextInput} from 'react-native-gesture-handler';
import FolderGrid from '../FolderGrid';
import AppContext from '../../context/AppContext';
import {PlayerItem} from '../../context/AppContext';

const {width} = Dimensions.get('window');

const margin = 8;
const padding = 10;
const folderViewContainerWidth = width - margin * 2;
const itemWidth = folderViewContainerWidth / 3 - padding * 2;
const folderViewContainerHeight = itemWidth * 3 + margin * 10 + padding * 2;
const itemHeight = itemWidth;
const deleteSize = 30;

type Props = {
  onClose: (x: number, y: number) => void;
  openFolder: (folderData: any) => void;
  setDummyData: (newData: any[]) => void;
  data: PlayerItem[];
  folderData: any;
};

function FolderView({onClose, openFolder, data, folderData}: Props) {
  const {dummyData, setDummyData} = useContext(AppContext);
  const [order, setOrder] = useState(
    dummyData.find(item => item.index === folderData.index)?.folderOrder || [],
  );
  const display = useSharedValue('flex');

  const [isOutside, setIsOutside] = useState(false);

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
    console.log('newOrder: ', newOrder);
    const newData = data.map(item => {
      if (item.index === folderData.index) {
        return {...item, folderOrder: newOrder};
      }
      return item;
    });
    console.log('newData: ', newData);
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

  return (
    <>
      <Portal>
        <Animated.View entering={FadeIn} exiting={FadeOut} />
        {isOutside ? null : (
          <BlurView
            {...(Platform.OS === 'ios' && {blurType: 'light'})}
            style={[s.portalContainer]}>
            <TouchableOpacity
              style={{
                ...StyleSheet.absoluteFillObject,
              }}
              onPress={() => {
                onClose(0, 0);
              }}
            />
          </BlurView>
        )}
        {isOutside ? null : (
          <View style={s.folderNameContainer}>
            <TextInput style={s.folderName}>{folderData.name}</TextInput>
          </View>
        )}

        {isOutside ? null : (
          <Animated.View style={[s.folderViewContainer]}></Animated.View>
        )}

        <Portal>
          <FolderGrid<TileType>
            isFolderGrid={true}
            display={display}
            data={
              dummyData.find(item => item.index === folderData.index)
                .nestedPlayers
            }
            openFolder={openFolder}
            onClose={onClose}
            handleDelete={deleteFromFolder}
            initialOrder={folderData.folderOrder}
            renderItem={item =>
              React.cloneElement(
                <Tile width={itemWidth} height={itemHeight} item={item} />,
              )
            }
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
            parentWidth={isOutside ? -100 : folderViewContainerWidth}
            parentHeight={isOutside ? -100 : folderViewContainerHeight}
            itemHeight={itemHeight}
            itemMargin={margin}
            offsetY={margin}
            folderIndex={folderData.index}
            isOutside={isOutside}
            setIsOutside={setIsOutside}
          />
        </Portal>
      </Portal>
    </>
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
    position: 'absolute',
    top: 150,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(27,27,27,0.5)',
    borderRadius: 30,
    width: folderViewContainerWidth,
    height: folderViewContainerHeight,
    paddingBottom: 10,
  },
  folderNameContainer: {
    marginBottom: 75,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  folderName: {
    fontSize: 24,
    color: 'black',
  },
});
