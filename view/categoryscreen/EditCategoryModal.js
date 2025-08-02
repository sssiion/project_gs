// EditCategoryModal.js
import React from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * 카테고리 이름 수정 모달 컴포넌트
 * 
 * @param {boolean} visible - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 함수
 * @param {string} editCategoryName - 수정 중인 카테고리 이름 상태값
 * @param {function} setEditCategoryName - 이름 변경 함수
 * @param {function} onEdit - 수정 완료 버튼 클릭 시 호출 함수
 */
export default function EditCategoryModal({
  visible,
  onClose,
  editCategoryName,
  setEditCategoryName,
  onEdit,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose} // Android 뒤로가기 시 모달 닫기
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* 제목 */}
          <Text style={styles.title}>카테고리 이름 수정</Text>

          {/* 입력창 */}
          <TextInput
            value={editCategoryName}
            onChangeText={setEditCategoryName}
            placeholder="새 이름을 입력하세요"
            style={styles.input}
          />

          {/* 버튼 컨테이너 */}
          <View style={styles.buttonContainer}>
            {/* 수정 버튼 */}
            <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onEdit}>
              <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>

            {/* 취소 버튼 */}
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center', // 수직 중앙 정렬
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 배경
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white', // 모달 배경 흰색
    borderRadius: 10, // 모서리 둥글게
    padding: 20,
  },
  title: {
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row', // 버튼 가로 배치
    justifyContent: 'space-between', // 버튼 간격 띄우기
    gap: 10, // 버튼 간격
  },
  button: {
    flex: 1, // 버튼 너비 균등 분배
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center', // 텍스트 중앙 정렬
  },
  cancelBtn: {
    backgroundColor: '#457b9d', // 취소
  },
  confirmBtn: {
    backgroundColor: '#1d3557', // 수정
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
