import React from 'react';
import { View, Text,StyleSheet,SafeAreaView,TouchableOpacity   } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Headercomponent2 = ( props ) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const handleIconPress =() => {
    if (navigation && navigation.goBack) {
          navigation.goBack();
        } else {
          // navigation이 없을 때의 예외 처리
          alert('뒤로가기 기능을 사용할 수 없습니다.');
        }
  };
  return (
    <View style={[stylesHeader2.containerHeader2, { paddingTop: insets.top }]}>
          <View style={stylesHeader2.rowContainer}>
            <View style={stylesHeader2.side}>
              <TouchableOpacity onPress={handleIconPress} activeOpacity={0.2}>
                <Icon name="arrowleft" size={20} />
              </TouchableOpacity>
            </View>
            <View style={stylesHeader2.center}>
              <Text style={stylesHeader2.textfonth}>{props.headertext}</Text>
            </View>
            <View style={stylesHeader2.side}></View>
          </View>
    </View>
  );
};
const stylesHeader2 = StyleSheet.create({
  containerHeader2: {
    padding: 16,
     backgroundColor: '#f0f0f0',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',

  },
  side:{
    flex:1,
    alignItems :'flex-start'

  },

  center:{
    flex:2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textfonth:{
      fontSize: 20,
      fontWeight: 'bold',
  },
});
export default Headercomponent2;
