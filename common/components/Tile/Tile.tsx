/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, View} from 'react-native';
import Styles from './styles';

type Props = {
  item: any;
  width: number;
  height: number;
};

function Tile({item, width, height}: Props) {
  const players = item.nestedPlayers?.slice(0, 9);

  return (
    <>
      <Styles.Wrapper
        style={{
          width,
          height,
          backgroundColor: item.isFolder ? 'lightgreen' : 'lightblue',
        }}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: width - 20,
              height: height - 20,
              justifyContent: 'flex-start',
              alignItems: 'center',
              margin: 10,
            }}>
            {players?.map((player, index) => (
              <View
                key={index}
                style={{
                  width: (width - 20) / 3 - 4,
                  height: (height - 20) / 3 - 4,
                  backgroundColor: 'darkgreen',
                  margin: 2,
                  borderRadius: 3,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: 'white'}}>{player.name[0]}</Text>
              </View>
            ))}
          </View>
        </View>
      </Styles.Wrapper>
      <Text>{item.name}</Text>
    </>
  );
}

export default Tile;
