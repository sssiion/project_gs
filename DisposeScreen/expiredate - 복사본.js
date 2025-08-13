import React,{useState} from 'react';
import { View, Text,StyleSheet,SafeAreaView,TouchableOpacity   } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { CheckBox } from 'react-native-elements';



const Expiredate = ( ) => {
    const [checked, setChecked] = useState(false);
  return (
    <View style={stylesname.expire}>
        <View style={stylesname.iconview}>
                <Icon name="image" size={40} />
        </View>
        <View style={stylesname.productname}>
            <Text style={{fontWeight:'bold',fontSize:18,}}>상품명</Text>
                <Text style={{fontSize:12,}}>폐기 10분전</Text>
        </View>
        <View style={stylesname.count}>
            <CheckBox
                checkedIcon='dot-circle-o'
                uncheckedIcon='circle-o'
                checked={checked}
                onPress={ () => setChecked(prev => !prev)}
            />
        </View>

    </View>
  );
};
const stylesname = StyleSheet.create({
    expire :{
            height: 60,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',


            },
    iconview :{

        width: '13%',
        paddingLeft : 10,

    },
    productname :{
        justifyContent: 'center',
        paddingLeft :10,
        width: '40%',


    },
    count : {
        width : '47%',
        alignItems: 'flex-end',
        justifyContent: 'center',
    }

  });

export default Expiredate;
