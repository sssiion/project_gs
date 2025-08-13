import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { CheckBox } from 'react-native-elements';

const Expiredate = ({item}) => {

  const [checked, setChecked] = useState(false);
  const API_SERVER = 'http://10.0.2.2:3000';
  return (
    <View style={[stylesname.expire, checked && stylesname.expiredBg]}>


      <View style={stylesname.productname}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{item.itemName}</Text>
        <Text style={{ fontSize: 12, color: checked ? 'gray' : 'black' }}>
          {checked ? '✅ 폐기 완료' : `폐기까지 : ${item.remainingTime}`}
        </Text>
      </View>

      <View style={stylesname.count}>
        <CheckBox
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={checked}
          onPress={() => setChecked(prev => !prev)}
        />
      </View>
    </View>
  );
};

const stylesname = StyleSheet.create({
  expire: {
    marginVertical: 10, // 위아래 마진
    paddingVertical: 15, // 위아래 패딩
    paddingHorizontal: 10, //양 옆 패딩
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  expiredBg: {
    backgroundColor: '#d9d9d9', // 회색 배경 (폐기 완료 시)
  },
  productname: {
    justifyContent: 'center',
    paddingLeft: 10,
    width: '50%',
  },
  count: {
    width: '47%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default Expiredate;