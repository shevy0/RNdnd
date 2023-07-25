import styled from 'styled-components/native';
import colors from '../../helpers/colors';

const Styles = {
  Wrapper: styled.View`
    border-radius: 10px;
    background-color: lightgreen;
    justify-content: center;
    align-items: center;
    border-color: ${colors.darkBlue};
    border-width: 1px;
  `,
};

export default Styles;
