import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Category from './CategoryList';

const Tab = createMaterialTopTabNavigator();
//일단은 categoryType이 소비인거랑 유통인거 각각 가져오게
export default function NavScreen(){
    return(
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: {
                    fontSize: 20,
                    fontWeight: 'bold',
                    },
                }}
            >
            <Tab.Screen  name="소비">
                {() => <Category categoryType="소비"/>}
            </Tab.Screen>
            <Tab.Screen  name="유통">
                {() => <Category categoryType="유통"/>}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
