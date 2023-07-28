import {ScrollView} from 'react-native-gesture-handler';
import styled from 'styled-components/native';

const Styles = {
  Wrapper: styled.View`
    flex: 1;
    position: absolute;
    top: 180px;
    left: 8px;
  `,
  ScrollView: styled(ScrollView)`
    flex: 1;
  `,
  ButtonWrapper: styled.View`
    align-items: flex-end;
    padding-vertical: 10px;
  `,
  CancelPressable: styled.Pressable`
    position: absolute;
    width: 100%;
    height: 100%;
  `,
};

export default Styles;
