// ActionModal.js
import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * 카테고리 액션 모달 컴포넌트
 * 
 * @param {boolean} visible - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 함수
 * @param {string} categoryName - 선택된 카테고리 이름
 * @param {function} onDelete - 삭제 버튼 클릭 시 호출 함수
 * @param {function} onEditPress - 이름 변경 버튼 클릭 시 호출 함수
 */
export default function ActionModal({
  visible,
  onClose,
  categoryName,
  onDelete,
  onEditPress,
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
          {/* 선택된 카테고리 이름 */}
          <Text style={styles.categoryName}>{categoryName}</Text>

          {/* 이름 변경, 삭제 버튼 컨테이너 */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={onEditPress}
            >
              <Text style={styles.actionButtonText}>이름 변경</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={styles.actionButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>

          {/* 취소 버튼 */}
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton, { marginTop: 10 }]}
            onPress={onClose}
          >
            <Text style={styles.actionButtonText}>취소</Text>
          </TouchableOpacity>
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
  categoryName: {
    marginBottom: 15,
    fontWeight: '600',
    fontSize: 30,
    textAlign: 'center', // 텍스트 중앙 정렬
  },
  actionButtonContainer: {
    flexDirection: 'row', // 버튼 가로 배치
    justifyContent: 'space-between', // 버튼 사이 간격 띄우기
    gap: 10, // 버튼 간격
  },
  actionButton: {
    flex: 1, // 버튼 너비 균등 분배
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center', // 텍스트 중앙 정렬
    justifyContent: 'center', // 수직 중앙 정렬
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#e63946', // 삭제
  },
  editButton: {
    backgroundColor: '#1d3557', // 이름 변경
  },
  cancelButton: {
    backgroundColor: '#457b9d', // 취소
    minHeight: 40,
    paddingVertical: 5,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
