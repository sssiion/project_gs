// AddCategoryModal.js
import React from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * 새 카테고리 추가용 모달 컴포넌트
 * 
 * @param {boolean} visible - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 함수
 * @param {string} newCategoryName - 입력된 새 카테고리 이름
 * @param {function} setNewCategoryName - 카테고리 이름 변경 함수
 * @param {function} onAdd - 추가 버튼 클릭 시 호출 함수
 */
export default function AddCategoryModal({
  visible,
  onClose,
  newCategoryName,
  setNewCategoryName,
  onAdd,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose} // Android 뒤로가기 버튼 처리
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TextInput
            placeholder="카테고리 이름 입력"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            style={styles.input}
            autoFocus={true} // 모달 열리면 바로 입력 가능하도록
          />
          <View style={styles.buttonContainer}>
            {/* 취소 버튼 */}
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>

            {/* 추가 버튼 */}
            <TouchableOpacity
              style={[styles.button, styles.confirmBtn]}
              onPress={onAdd}
            >
              <Text style={styles.buttonText}>추가</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 검정 배경
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white', // 모달 배경 흰색
    borderRadius: 10, // 모서리 둥글게
    padding: 20,
  },
  input: {
    borderWidth: 1, // 테두리 두께
    borderColor: '#ccc', // 연한 회색 테두리
    borderRadius: 5,
    padding: 10,
    marginBottom: 15, // 아래쪽 여백
  },
  buttonContainer: {
    flexDirection: 'row', // 가로 배치
    justifyContent: 'space-between', // 버튼 간격 띄우기
    gap: 10, // 버튼 사이 간격 (Android 12 이상 지원)
  },
  button: {
    flex: 1, // 버튼 가로 폭 균등 분배
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center', // 텍스트 중앙 정렬
  },
  cancelBtn: {
    backgroundColor: '#457b9d', // 연한 파랑
  },
  confirmBtn: {
    backgroundColor: '#1d3557', // 진한 파랑
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
