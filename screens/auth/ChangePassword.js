import React, { useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
  UIManager,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as ActionChangepassword from "../../actions/action-change-password/ActionChangepassword";
import { Block } from "galio-framework";
import { formatTr } from "../../i18n/I18nProvider";
import WangdekInfo from "../../components/WangdekInfo";
import { Button } from "react-native-elements";
import { API_URL } from "../../config/config.app";
import { getToken } from "../../store/mock/token";
import ModalLoading from "../../components/ModalLoading";
import Toast from 'react-native-tiny-toast'

const token = getToken();

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function ChangePassword(props) {
  // const { objChangePassword } = useSelector((state) => ({
  //   objChangePassword: state.actionChangepassword.objChangePassword,
  // }));

  useEffect(() => {
    setStateObj("");
    setRequiredOldPassword(false);
    setRequiredNewPassword(false);
  }, []);

  const [stateObj, setStateObj] = useState({
    passwordOld: "",
    password1: "",
    password2: "",
  });

  const [loading, setLoading] = useState(true);
  const [requiredOldPassword, setRequiredOldPassword] = useState(false);
  const [requiredNewPassword, setRequiredNewPassword] = useState(false);
  const onChangePasswordOld = (e) => {
    let newObj = Object.assign({}, stateObj);
    newObj.passwordOld = e;
    setStateObj(newObj);
  };
  const onChangePassword1 = (e) => {
    let newObj = Object.assign({}, stateObj);
    newObj.password1 = e;
    setStateObj(newObj);
  };
  const onChangePassword2 = (e) => {
    let newObj = Object.assign({}, stateObj);
    newObj.password2 = e;
    setStateObj(newObj);
  };
  const submitChangePassword = async () => {
    setLoading(false);
    if (stateObj.password2 === stateObj.password1) {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + (await token);

      await axios
        .put(API_URL.CHANGE_PASSWORD_API, {
          headers: {
            Accept: "*/*",
            Authorization: "Bearer " + (await token),
            "Content-Type": "application/json",
          },
          old_password: stateObj.passwordOld,
          password: stateObj.password1,
          password_confirmation: stateObj.password2,
        })
        .then(function (response) {
          console.log(response.data);
          setLoading(true);
          Toast.show("Password updated!", {
            containerStyle:{ backgroundColor:"#f0f0f0", borderRadius:25},
            position: Toast.position.center,
            animation: true,
            textStyle: { fontSize:14,fontFamily: "kanitRegular", color:"#3b3838" },
          });
        })
        .catch(function (error) {
          console.log("error :", error);
          setLoading(true);
          setRequiredOldPassword(true);
          Toast.show("Password correct!", {
            containerStyle:{ backgroundColor:"#f0f0f0", borderRadius:25},
            position: Toast.position.center,
            animation: true,
            textStyle: { fontSize:14,fontFamily: "kanitRegular", color:"#3b3838" },
          });
        });
    } else {
      setLoading(true);
      setRequiredNewPassword(true);
      Toast.show("Passwords does not match", {
        containerStyle:{ backgroundColor:"#f0f0f0", borderRadius:25},
        position: Toast.position.center,
        animation: true,
        textStyle: { fontSize:14,fontFamily: "kanitRegular", color:"#3b3838" },
      });
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Title */}
          <TouchableOpacity
            onPress={() => props.navigation.navigate("Edit Profile")}
          >
            <Block
              row
              style={{
                paddingTop: 20,
                paddingLeft: 20,
                paddingBottom: 20,
                backgroundColor: "white",
              }}
            >
              <Text
                style={{
                  color: "black",
                  fontFamily: "kanitRegular",
                  fontSize: 18,
                }}
              >
                {"<  "}เปลี่ยนรหัสผ่าน
              </Text>
            </Block>
          </TouchableOpacity>
          {/* Input */}
          <Block style={styles.container2}>
            <Block row style={{ marginBottom: 5 }}>
              <Text
                style={{
                  alignSelf: "flex-start",
                  fontFamily: "kanitRegular",
                  fontSize: 18,
                  color: "black",
                }}
              >
                รหัสผ่านปัจจุบัน
              </Text>
            </Block>
            <View
              style={
                requiredOldPassword !== true
                  ? styles.inputView
                  : styles.inputViewRequired
              }
            >
              <TextInput
                style={styles.inputText}
                placeholder={"กรอกรหัสผ่านปัจจุบัน"}
                placeholderTextColor="#808080"
                value={stateObj.passwordOld}
                onChangeText={onChangePasswordOld}
              />
            </View>
            {/*  New Password */}
            <Block row style={{ marginBottom: 5 }}>
              <Text
                style={{
                  alignSelf: "flex-start",
                  fontFamily: "kanitRegular",
                  fontSize: 18,
                  color: "black",
                }}
              >
                รหัสผ่านใหม่
              </Text>
            </Block>
            <View
              style={
                requiredNewPassword !== true
                  ? styles.inputView
                  : styles.inputViewRequired
              }
            >
              <TextInput
                style={styles.inputText}
                placeholder={"กรอกรหัสผ่านใหม่"}
                placeholderTextColor="#808080"
                value={stateObj.password1}
                onChangeText={onChangePassword1}
                // secureTextEntry={true}
              />
            </View>
            <Block row style={{ marginBottom: 5 }}>
              <Text
                style={{
                  alignSelf: "flex-start",
                  fontFamily: "kanitRegular",
                  fontSize: 18,
                }}
              >
                ยืนยันรหัสผ่าน
              </Text>
            </Block>
            <View
              style={
                requiredNewPassword !== true
                  ? styles.inputView
                  : styles.inputViewRequired
              }
            >
              <TextInput
                style={styles.inputText}
                placeholder="ยืนยันรหัสผ่าน"
                placeholderTextColor="#808080"
                value={stateObj.password2}
                onChangeText={onChangePassword2}
                // secureTextEntry={true}
              />
            </View>
          </Block>
          {/* Botton */}
          <Block
            style={{
              width: "90%",
              alignSelf: "center",
              paddingBottom: 25,
            }}
          >
            <Block row style={{ paddingTop: 30, paddingBottom: 30 }}>
              <Button
                titleStyle={{ color: "white", fontFamily: "kanitRegular" }}
                title={"ย้อนกลับ"}
                type="solid"
                onPress={() => props.navigation.navigate("Edit Profile")}
                containerStyle={styles.blockButton1}
                buttonStyle={styles.buttonStyle1}
              />
              <Button
                titleStyle={{ color: "white", fontFamily: "kanitRegular" }}
                title={"ยืนยัน"}
                type="solid"
                containerStyle={styles.blockButton2}
                buttonStyle={styles.buttonStyle2}
                onPress={submitChangePassword}
              />
            </Block>
          </Block>
          {/* Info */}
          <WangdekInfo />
        </ScrollView>
      </View>
      <ModalLoading loading={!loading} />
    </>
  );
}

export default connect(null, ActionChangepassword.actions)(ChangePassword);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "column",
  },
  container2: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 25,
    paddingLeft: 25,
  },
  inputView: {
    width: "95%",
    backgroundColor: "#ffffff",
    height: 40,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20,
    borderWidth: 1.4,
    borderColor: "#e0e0e0",
  },
  inputViewRequired: {
    width: "95%",
    backgroundColor: "#ffffff",
    borderColor: "red",
    borderWidth: 1.4,
    height: 40,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20,
  },
  inputText: {
    height: 50,
    color: "black",
    fontSize: 15,
    fontFamily: "kanitRegular",
  },
  rowTouch: {
    flexDirection: "column",
  },
  forgot: {
    color: "black",
    fontSize: 14,
    alignItems: "flex-end",
    fontFamily: "kanitRegular",
    borderBottomWidth: 1,
  },
  forgetButton: {
    width: "60%",
    backgroundColor: "#0ec99a",
    borderRadius: 20,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 25,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  blockButton1: {
    flexDirection: "row",
    paddingLeft: 15,
  },
  blockButton2: {
    paddingLeft: 25,
  },
  buttonStyle1: {
    backgroundColor: "#535454",
    borderRadius: 20,
    width: 150,
    alignSelf: "center",
  },
  buttonStyle2: {
    backgroundColor: "#00c278",
    borderRadius: 20,
    width: 150,
    alignSelf: "center",
  },
});
