import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const CustomAlert = ({
  visible,
  title,
  message,
  onClose,
  confirmText = "OK",
  cancelText,
  onConfirm,
}) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>

          <View
            style={[
              styles.buttonContainer,
              cancelText ? styles.twoButtons : styles.oneButton,
            ]}
          >
            {cancelText && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm || onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: wp("80%"),
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("3%"),
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  title: {
    fontSize: wp("5%"),
    fontWeight: "700",
    color: "#0c4a6e",
    marginBottom: hp("1%"),
    textAlign: "center",
  },
  message: {
    fontSize: wp("4%"),
    color: "#334155",
    textAlign: "center",
    marginBottom: hp("2.5%"),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  oneButton: {
    justifyContent: "center",
  },
  twoButtons: {
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: hp("1.3%"),
    alignItems: "center",
    marginHorizontal: wp("1.5%"),
  },
  confirmButton: {
    backgroundColor: "#0284c7",
  },
  cancelButton: {
    backgroundColor: "#e2e8f0",
  },
  buttonText: {
    fontSize: wp("4%"),
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#334155",
  },
});
