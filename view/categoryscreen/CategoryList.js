import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import axios from 'axios';
import Category from './Category.js';
import AddCategoryModal from './AddCategoryModal.js';
import EditCategoryModal from './EditCategoryModal.js';
import ActionModal from './ActionModal.js';



export default function CategoryList({ navigation, categoryType ,getCategories,handleAddCategory,handleEditCategory,handleDeleteCategory}) {

  const [modalVisible, setModalVisible] = useState(false);  // 새 카테고리 추가 모달 표시 여부
  const [newCategoryName, setNewCategoryName] = useState('');  // 새 카테고리 이름 상태
  const [editModalVisible, setEditModalVisible] = useState(false);  // 카테고리 수정 모달 표시 여부
  const [editCategoryName, setEditCategoryName] = useState('');  // 수정할 카테고리 이름 상태
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);  // 현재 선택된 카테고리 ID (수정/삭제용)
  const [actionModalVisible, setActionModalVisible] = useState(false);  // 액션 모달(수정/삭제 선택 모달) 표시 여부
  const [selectedCategoryName, setSelectedCategoryName] = useState('');  // 현재 선택된 카테고리 이름 (액션 모달용)
  const API_SERVER = 'http://10.0.2.2:3000';
  // categoryType이 변경되면 서버에서 해당 타입 카테고리 목록 불러오기

  useEffect(() => {
         getCategories({categoryType})
        }, []);

  // 액션 모달 열기 (수정/삭제 선택)
  const openActionModal = (category) => {
    setSelectedCategoryId(category.id);
    setSelectedCategoryName(category.name);
    setActionModalVisible(true);
  };

  // 새 카테고리 추가 모달 닫기 및 입력 초기화
  const closeAddModal = () => {
    setModalVisible(false);
    setNewCategoryName('');
  };

  // 카테고리 수정 모달 닫기 및 입력 초기화
  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditCategoryName('');
    setSelectedCategoryId(null);
  };

  const addCategory = () => {
   try{
        handleAddCategory({newCategoryName,categoryType});
        closeAddModal();
       }catch (err){
           consol.error('카테고리  수정 실패', err);
       }
  };

  const editCategory = () => {
    try{
        handleEditCategory({editCategoryName,selectedCategoryId});
        closeEditModal();
    }catch (err){
        consol.error('카테고리  수정 실패', err);
    }
  };
  const deleteCategory = () => {
      try{
          handleDeleteCategory({selectedCategoryId});
          setActionModalVisible(false);
          setSelectedCategoryId(null);
          setSelectedCategoryName('');
      }catch (err){
          consol.error('카테고리  수정 실패', err);
      }
    };
  // 마지막에 "+" 버튼용 아이템 추가
  const data = [...categories, { id: 'plus-btn', name: '+', isPlus: true }];

  return (
    <View style={{ padding: 15 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) =>
          item.isPlus ? (
            // "+" 버튼 눌렀을 때 새 카테고리 추가 모달 열기
            <Category name="+" isPlus onPress={() => setModalVisible(true)} />
          ) : (
            // 일반 카테고리 아이템 (탭: 검색 화면 이동, 롱탭: 액션 모달)
            <Category
              name={item.name}
              onPress={() => navigation.navigate('SearchScreen', { categoryId: item.id })}
              onLongPress={() => openActionModal(item)}
            />
          )
        }
        contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
        columnWrapperStyle={{ justifyContent: 'space-between', gap: 10 }}
      />

      {/* 새 카테고리 추가 모달 */}
      <AddCategoryModal
        visible={modalVisible}
        onClose={closeAddModal}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onAdd={handleAddCategory}
      />

      {/* 카테고리 이름 수정 모달 */}
      <EditCategoryModal
        visible={editModalVisible}
        onClose={closeEditModal}
        editCategoryName={editCategoryName}
        setEditCategoryName={setEditCategoryName}
        onEdit={handleEditCategory}
      />

      {/* 액션 모달 (이름 변경, 삭제 선택) */}
      <ActionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        categoryName={selectedCategoryName}
        onDelete={handleDeleteCategory}
        onEditPress={() => {
          setEditCategoryName(selectedCategoryName);
          setActionModalVisible(false);
          setEditModalVisible(true);
        }}
      />
    </View>
  );
}
