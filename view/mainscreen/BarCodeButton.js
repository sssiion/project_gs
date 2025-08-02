import React from 'react';
import {Text,StyleSheet,TouchableOpacity} from 'react-native';

//버튼 기능은 가져다쓸때 정의
function BarCodeButton(){
    return(
        <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.title}>Scan Barcode</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button:{
        backgroundColor: '#0EB4FC',
        alignItems: 'center',
        borderRadius: 10,
        width: '80%',
        margin: 15,
        padding: 15,
        paddingBottom:10,
    },
    title: {
        fontSize:20,
        fontWeight:'bold',
        color: 'white',
    },
});

export default BarCodeButton;