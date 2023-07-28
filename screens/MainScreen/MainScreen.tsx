import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Dimensions, Text} from 'react-native';
import DeleteButton from '../../common/components/DeleteButton';
import Tile from '../../common/components/Tile';
import colors from '../../common/helpers/colors';
import Styles from './styles';
import FolderView from '../../common/components/FolderView';
import MainGrid from '../../common/components/MainGrid';
import AppContext from '../../common/context/AppContext';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {TouchableOpacity} from 'react-native-gesture-handler';

const margin = 8;
const itemWidth = Dimensions.get('window').width / 3 - margin * 2.5;
const itemHeight = itemWidth;
const deleteSize = 30;

// const initialData = new Array(10)
//   .fill(null)
//   .map((_, i) => ({index: i, name: `Tile ${i}`}));

type TileType = {
  index: number;
};

function MainScreen() {
  const {
    dummyData,
    setDummyData,
    contextOrder,
    setContextOrder,
    draggedItem,
    draggedCoordinates,
    loading,
    setLoading,
    createNewFolder,
  } = useContext(AppContext);

  // useEffect(() => {
  //   setDummyData(initialData);
  //   setContextOrder(initialData.map((item: any) => item.index));
  // }, []);

  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [openedFolderIndex, setOpenedFolderIndex] = useState<any>(null);

  const openFolder = useCallback((folderData: any) => {
    setOpenedFolderIndex(folderData.index);
    setIsFolderOpen(true);
  }, []);

  const closeFolder = () => {
    setIsFolderOpen(false);
  };

  const handleDelete = useCallback((index: number) => {
    setDummyData(prev => prev.filter(value => value.index !== index));
    setContextOrder(prev => prev.filter(value => value !== index));
    setLoading(true);
  }, []);

  useEffect(() => {
    if (loading) {
      setLoading(false);
    }
  }, [loading]);

  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       'https://64b92eaf79b7c9def6c0b78b.mockapi.io/api/filesystem/folders',
  //     );
  //     const json = await response.json();
  //     console.log('json: ', json);
  //     setDummyData(json);
  //     setOrder(json.map((item: any) => item.index));
  //     setLoading(false);
  //   } catch (error) {
  //     console.log('error: ', error);
  //   }
  // };

  const draggedItemStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: draggedCoordinates.value.x - itemWidth / 2,
        },
        {
          translateY: draggedCoordinates.value.y - itemHeight / 2,
        },
      ],
      zIndex: 99,
    };
  });

  return (
    <Styles.Wrapper>
      {draggedItem && draggedCoordinates ? (
        <Animated.View
          style={[draggedItemStyle, {position: 'absolute', zIndex: 99}]}>
          <Tile width={itemWidth} height={itemHeight} item={draggedItem} />
        </Animated.View>
      ) : null}
      {loading ? (
        <Styles.LoadingWrapper>
          <ActivityIndicator color={colors.darkBlue} size="large" />
        </Styles.LoadingWrapper>
      ) : (
        <>
          <Styles.OrderTextWrapper>
            <Text>
              The current contextOrder is:{' '}
              {contextOrder.map(
                (value, i, array) =>
                  `${value}${i !== array.length - 1 ? ',' : ''}`,
              )}
            </Text>
            <TouchableOpacity onPress={createNewFolder}>
              <Text>Create new folder</Text>
            </TouchableOpacity>
          </Styles.OrderTextWrapper>
          {dummyData.length > 0 && contextOrder.length > 0 ? (
            <MainGrid<TileType>
              data={dummyData}
              openFolder={openFolder}
              handleDelete={handleDelete}
              initialOrder={contextOrder}
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
              onOrderingFinished={newOrder => setContextOrder(newOrder)}
              onChangeDataFinished={newData => setDummyData(newData)}
              itemWidth={itemWidth}
              parentWidth={Dimensions.get('window').width}
              itemHeight={itemHeight}
              itemMargin={margin}
              offsetY={margin}
            />
          ) : null}
        </>
      )}
      {isFolderOpen && (
        <FolderView
          onClose={closeFolder}
          data={dummyData}
          folderData={dummyData.find(item => item.index === openedFolderIndex)}
          openFolder={openFolder}
          setDummyData={setDummyData}
        />
      )}
    </Styles.Wrapper>
  );
}

export default MainScreen;
