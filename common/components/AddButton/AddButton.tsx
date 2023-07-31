import React from 'react';
import {Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Styles from './styles';

type Props = {
  size: number;
};

function AddButton({size}: Props) {
  return (
    <TouchableOpacity>
      <Styles.Wrapper
        style={{width: size, height: size, borderRadius: size / 2}}>
        <Text>+</Text>
      </Styles.Wrapper>
    </TouchableOpacity>
  );
}

export default AddButton;
