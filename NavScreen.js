import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
//import Category from './categoryscreen/CategoryList.js'; CategoryList.js
import Category from './CategoryList.js';
const Tab = createMaterialTopTabNavigator();
//일단은 categoryType이 소비인거랑 유통인거 각각 가져오게
export default function NavScreen({fetchItems,navigation,getCategories,categories,handleAddCategory,handleEditCategory,handleDeleteCategory}){
    const API_SERVER = 'http://10.0.2.2:3000';
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
                {({ navigation }) => <Category categoryType="소비"  navigation={navigation} getCategories={getCategories}
                                                handleAddCategory={handleAddCategory}
                                                 handleEditCategory={handleEditCategory}
                                                 handleDeleteCategory={handleDeleteCategory}
                                                 categories={categories}
                                                 fetchItems={fetchItems}
                                                 />}
            </Tab.Screen>
            <Tab.Screen  name="유통">
               {({ navigation }) => <Category categoryType="유통"   navigation={navigation} getCategories={getCategories}
                                                handleAddCategory={handleAddCategory}
                                                 handleEditCategory={handleEditCategory}
                                                 handleDeleteCategory={handleDeleteCategory}
                                                categories={categories}/>}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
