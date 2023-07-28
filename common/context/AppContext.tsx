import React, {useCallback, useEffect, useState} from 'react';
import {useSharedValue} from 'react-native-reanimated';

export interface PlayerItem {
  index: number;
  name: string;
  isFolder?: boolean;
  nestedPlayers?: PlayerItem[];
  folderOrder?: number[];
}

interface AppContextValue {
  dummyData: PlayerItem[];
  setDummyData: React.Dispatch<React.SetStateAction<PlayerItem[]>>;
  contextOrder: number[];
  setContextOrder: React.Dispatch<React.SetStateAction<number[]>>;
  draggedItem: PlayerItem | null;
  setDraggedItem: React.Dispatch<React.SetStateAction<PlayerItem | null>>;
  draggedCoordinates: any;
  mainSharedOrder: any;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  addToMainGrid: (item: PlayerItem) => void;
  createNewFolder: () => void;
}

const AppContext = React.createContext<AppContextValue>({});

const initialData: PlayerItem[] = [
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

export const AppProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [dummyData, setDummyData] = useState<PlayerItem[]>([]);
  const [contextOrder, setContextOrder] = useState<number[]>([]);
  const [draggedItem, setDraggedItem] = useState<PlayerItem | null>(null);
  const draggedCoordinates = useSharedValue<{x: number; y: number}>({
    x: 0,
    y: 0,
  });
  const mainSharedOrder = useSharedValue<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setDummyData(initialData);
    setContextOrder(initialData.map(item => item.index));
  }, []);

  const addToMainGrid = useCallback((item: PlayerItem) => {
    setDummyData(prev => [item, ...prev]);
    setContextOrder(prev => [item.index, ...prev]);
    setLoading(true);
  }, []);

  const createNewFolder = useCallback(() => {
    const newFolder: PlayerItem = {
      index: Math.floor(Math.random() * 1000),
      name: 'New Folder',
      isFolder: true,
      nestedPlayers: [],
      folderOrder: [],
    };
    setDummyData(prev => [newFolder, ...prev]);
    setContextOrder(prev => [newFolder.index, ...prev]);
    setLoading(true);
  }, []);

  return (
    <AppContext.Provider
      value={{
        dummyData,
        setDummyData,
        contextOrder,
        setContextOrder,
        draggedItem,
        setDraggedItem,
        draggedCoordinates,
        mainSharedOrder,
        loading,
        setLoading,
        addToMainGrid,
        createNewFolder,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
