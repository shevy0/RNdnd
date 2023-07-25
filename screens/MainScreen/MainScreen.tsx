import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Dimensions, Text} from 'react-native';
import DeleteButton from '../../common/components/DeleteButton';
import Tile from '../../common/components/Tile';
import colors from '../../common/helpers/colors';
import Styles from './styles';
import FolderView from '../../common/components/FolderView';
import MainGrid from '../../common/components/MainGrid';

const margin = 8;
const itemWidth = Dimensions.get('window').width / 3 - margin * 2.5;
const itemHeight = itemWidth;
const deleteSize = 30;

// const initialData = new Array(10)
//   .fill(null)
//   .map((_, i) => ({index: i, name: `Tile ${i}`}));

type dataElementType = {
  index: number;
  name: string;
  isFolder?: boolean;
  nestedPlayers?: any[];
  folderOrder?: number[];
};

const initialData = [
  {
    index: 101,
    name: 'Lech',
    isFolder: true,
    nestedPlayers: [
      {
        index: 76,
        name: 'Michał',
        isFolder: true,
        nestedPlayers: [
          {
            index: 100,
            name: 'XDD',
          },
        ],
      },
      {index: 77, name: 'Tomasz'},
      {index: 78, name: 'Cezary'},
      {index: 79, name: 'Dawid'},
      {index: 80, name: 'Krzysztof'},
      {index: 81, name: 'Paweł'},
      {index: 82, name: 'Rafał'},
      {index: 83, name: 'Sebastian'},
      {index: 84, name: 'Szymon'},
      {index: 85, name: 'Wojciech'},
      {index: 86, name: 'Zbigniew'},
      {index: 87, name: 'Łukasz'},
      {index: 88, name: 'Marian'},
      {index: 89, name: 'Patryk'},
      {index: 90, name: 'John'},
      {index: 91, name: 'Jane'},
      {index: 92, name: 'Kamil'},
      {index: 93, name: 'Legia'},
      {index: 94, name: 'Adam'},
    ],
    folderOrder: [
      76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93,
      94,
    ],
  },
  {index: 102, name: 'Patryk'},
  {index: 103, name: 'John'},
  {index: 3, name: 'Jane'},
  {index: 4, name: 'Kamil'},
  {
    index: 5,
    name: 'Legia',
    isFolder: true,
    nestedPlayers: [],
    folderOrder: [],
  },
  {index: 6, name: 'Michał'},
  {index: 7, name: 'Tomasz'},
  {index: 8, name: 'Cezary'},
  {index: 11, name: 'Dawid'},
  {index: 12, name: 'Krzysztof'},
  {index: 13, name: 'Paweł'},
  {index: 14, name: 'Rafał'},
  {index: 15, name: 'Sebastian'},
  {index: 16, name: 'Szymon'},
  {index: 17, name: 'Wojciech'},
  {index: 18, name: 'Zbigniew'},
  {index: 19, name: 'Łukasz'},
  {index: 20, name: 'XD'},
];

type TileType = {
  index: number;
};

function MainScreen() {
  const [dummyData, setDummyData] = useState<dataElementType[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  console.log('dummyData: ', JSON.stringify(dummyData, null, 2));
  console.log('order: ', order);
  useEffect(() => {
    setDummyData(initialData);
    setOrder(initialData.map((item: any) => item.index));
  }, []);

  const [loading, setLoading] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [openedFolderIndex, setOpenedFolderIndex] = useState<any>(null);

  const openFolder = useCallback((folderData: any) => {
    setOpenedFolderIndex(folderData.index);
    setIsFolderOpen(true);
  }, []);

  const handleDelete = useCallback((index: number) => {
    setOrder(prev => prev.filter(value => value !== index));
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

  return (
    <Styles.Wrapper>
      {loading ? (
        <Styles.LoadingWrapper>
          <ActivityIndicator color={colors.darkBlue} size="large" />
        </Styles.LoadingWrapper>
      ) : (
        <>
          <Styles.OrderTextWrapper>
            <Text>
              The current order is:{' '}
              {order.map(
                (value, i, array) =>
                  `${value}${i !== array.length - 1 ? ',' : ''}`,
              )}
            </Text>
          </Styles.OrderTextWrapper>
          {dummyData.length > 0 && order.length > 0 ? (
            <MainGrid<TileType>
              data={dummyData}
              openFolder={openFolder}
              handleDelete={handleDelete}
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
              onOrderingFinished={newOrder => setOrder(newOrder)}
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
          onClose={() => {
            setIsFolderOpen(false);
          }}
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
