import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axios from "axios";
import moment from "moment";
import "moment-duration-format";
import "moment/locale/th";
import "moment/locale/en-au";
import { Block, Input } from "galio-framework";
import { connect, useSelector } from "react-redux";
import * as ActionPaymentNotifications from "../../actions/action-payment/ActionPaymentNotifications";
import { Button } from "react-native-elements";
import { formatTr } from "../../i18n/I18nProvider";
import WangdekInfo from "../../components/WangdekInfo";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../config/config.app";
import { getToken } from "../../store/mock/token";
import ModalLoading from "../../components/ModalLoading";
import Toast from 'react-native-tiny-toast'

const { width } = Dimensions.get("screen");
const token = getToken();

function PaymentNotifications(props) {
  const locale = useSelector(({ i18n }) => i18n.lang);
  if (locale === "th") {
    moment.locale("th");
  } else {
    moment.locale("en-au");
  }
  const [loading, setLoading] = useState(null);
  const [objSearch, setObjSearch] = useState({
    order_no: "",
    fullname: "",
    telephone: "",
    email: "",
    money_transfer: "",
    bank_code: 0,
    bank_name: "",
    transfer_date: moment(new Date()).format("YYYY-MM-DD"),
    transfer_time: moment(new Date()).format("HH : mm"),
  });

  useEffect(() => {
    setObjSearch({
      order_no: "",
      fullname: "",
      telephone: "",
      email: "",
      money_transfer: "",
      bank_code: 0,
      bank_name: "",
      transfer_date: moment(new Date()).format("YYYY-MM-DD"),
      transfer_time: moment(new Date()).format("HH : mm"),
    });
    getBankList();
  }, []);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirmDate = (date) => {
    let newObj = Object.assign({}, objSearch);
    if (date === null) {
      newObj.transfer_date = moment(new Date()).format();
    } else {
      newObj.transfer_date = moment(date).format("DD/MM/YYYY");
    }
    setObjSearch(newObj);
    hideDatePicker();
  };
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };
  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };
  const handleConfirmTime = (date) => {
    let newObj = Object.assign({}, objSearch);
    if (date === null) {
      newObj.transfer_time = moment(new Date()).format();
    } else {
      newObj.transfer_time = moment(date).format("HH:mm");
    }
    setObjSearch(newObj);
    setTimePickerVisibility(false);
  };

  const [bankList, setBankList] = useState([
    {
      label: objSearch.bank_name,
      value: objSearch.bank_code,
    },
  ]);
  const getBankList = async () => {
    await axios
      .get(API_URL.BANK_LIST_HD_API, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + (await token),
          "Content-Type": "application/json",
        },
      })
      .then(function (response) {
        let newlstBin = response.data.data.map(function (item) {
          item.label = item.bank_name_en + " - " + item.bank_name_th;
          item.value = item.id;
          return item;
        });
        setBankList(newlstBin);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const onChangeBank = (item) => {
    let newObj = Object.assign({}, objSearch);
    newObj.bank_code = item.value;
    newObj.bank_name = item.label;
    setObjSearch(newObj);
  };

  const onChangeOrderNumber = (e) => {
    let newObj = Object.assign({}, objSearch);
    newObj.order_no = e;
    setObjSearch(newObj);
  };
  const onChangeFullname = (e) => {
    let newObj = Object.assign({}, objSearch);
    newObj.fullname = e;
    setObjSearch(newObj);
  };
  const onChangePhoneNumber = (e) => {
    let newObj = Object.assign({}, objSearch);
    newObj.telephone = e;
    setObjSearch(newObj);
  };
  const onChangeEmail = (e) => {
    let newObj = Object.assign({}, objSearch);
    newObj.fullname = e;
    setObjSearch(newObj);
  };
  const onChangeTransferMoney = (e) => {
    let newObj = Object.assign({}, objSearch);
    newObj.money_transfer = e;
    setObjSearch(newObj);
  };

  // Image Picker Profile
  const [imagePicker, setImagePicker] = useState(null);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.cancelled) {
      return;
    }
    setImagePicker(result.uri);
  };

  const onPaymentTransfer = async () => {

    setLoading(true);
    await axios
      .get(API_URL.CHECK_ORDER_PAYMENT_API + objSearch.order_no, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + (await token),
          "Content-Type": "application/json",
        },
      })
      .then(async (response) => {

        let formData = new FormData();
        if (response.data.success !== true) {
          setLoading(false);
          Toast.show(response.data.message, {
            containerStyle:{ backgroundColor:"#f0f0f0", borderRadius:25},
            position: Toast.position.center,
            animation: true,
            textStyle: { fontSize:14,fontFamily: "kanitRegular", color:"#3b3838" },
          });
        } else {
          if (imagePicker != null) {
            let localUri = imagePicker;
            let filename = localUri.split("/").pop();

            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;

            formData.append("orders_code", objSearch.order_no);
            formData.append("bank_accounts_id", objSearch.bank_code);
            formData.append("fullname", objSearch.fullname);
            formData.append("contact", objSearch.telephone);
            formData.append("email", objSearch.email);
            formData.append("payment_date", moment(objSearch.transfer_date).format(
              "YYYY-MM-DD"
            ));
            formData.append("payment_time", moment(objSearch.payment_time).format("HH:mm"));
            formData.append("amount", objSearch.money_transfer);
            formData.append("image", { uri: localUri, name: filename, type });

            await axios({
              method: "POST",
              url: API_URL.PAYMENTS_TRANSFER_API,
              headers: {
                "content-type": "multipart/form-data",
                Authorization: "Bearer " + (await token),
              },
              data: formData,
            }).then(function (response) {
              setLoading(false);
              Toast.show(response.data.data, {
                containerStyle:{ backgroundColor:"#f0f0f0", borderRadius:25},
                position: Toast.position.center,
                animation: true,
                textStyle: { fontSize:14,fontFamily: "kanitRegular", color:"#3b3838" },
              });
            });
          }
        }
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
        Toast.show(error.response.data.data, {
          containerStyle:{ backgroundColor:"#f0f0f0", borderRadius:25},
          position: Toast.position.center,
          animation: true,
          textStyle: { fontSize:14,fontFamily: "kanitRegular", color:"#3b3838" },
        });
      });
    setLoading(false);
  };

  return (
    <>
      <ScrollView
        style={{ backgroundColor: "white" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Order */}
        <Block style={styles.blockStyle}>
          <Text
            style={{
              color: "black",
              fontFamily: "kanitRegular",
              fontSize: 23,
              textAlign: "center",
            }}
          >
            {formatTr("PAYMENT_NOTIFICATION").toString()}
          </Text>
        </Block>
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
              หมายเลขสั่งซื้อ :
            </Text>
          </Block>
          <Block style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder={"หมายเลขสั่งซื้อ"}
              placeholderTextColor="#808080"
              value={objSearch.order_no}
              onChangeText={onChangeOrderNumber}
            />
          </Block>
        </Block>

        {/* Detail */}
        <Block style={styles.blockStyle}>
          <Text
            style={{
              color: "black",
              fontFamily: "kanitRegular",
              fontSize: 23,
              textAlign: "center",
            }}
          >
            ข้อมูลผู้ชำระ
          </Text>
        </Block>
        <Block style={styles.container2}>
          <Block style={{ marginBottom: 5 }}>
            <Text
              style={{
                alignSelf: "flex-start",
                fontFamily: "kanitRegular",
                fontSize: 18,
                color: "black",
              }}
            >
              ชื่อ-นามสกุล :
            </Text>
          </Block>
          <Block style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder={"ชื่อ-นามสกุล"}
              placeholderTextColor="#808080"
              value={objSearch.fullname}
              onChangeText={onChangeFullname}
            />
          </Block>
          <Block style={{ marginBottom: 5 }}>
            <Text
              style={{
                alignSelf: "flex-start",
                fontFamily: "kanitRegular",
                fontSize: 18,
                color: "black",
              }}
            >
              เบอร์ติดต่อ :
            </Text>
          </Block>
          <Block style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder={"เบอร์โทรศัพท์"}
              placeholderTextColor="#808080"
              value={objSearch.telephone}
              onChangeText={onChangePhoneNumber}
              keyboardType={"phone-pad"}
            />
          </Block>
          <Block style={{ marginBottom: 5 }}>
            <Text
              style={{
                alignSelf: "flex-start",
                fontFamily: "kanitRegular",
                fontSize: 18,
                color: "black",
              }}
            >
              อีเมล :
            </Text>
          </Block>
          <Block style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder={"example@mail.com"}
              placeholderTextColor="#808080"
              value={objSearch.email}
              onChangeText={onChangeEmail}
              keyboardType={"email-address"}
            />
          </Block>
        </Block>

        {/* Bank */}
        <Block style={styles.blockStyle}>
          <Text
            style={{
              color: "black",
              fontFamily: "kanitRegular",
              fontSize: 18,
              textAlign: "left",
            }}
          >
            โอนเข้าบัญชี
          </Text>
          <DropDownPicker
            items={bankList}
            containerStyle={{ height: 40, width: width - 45 }}
            style={{ backgroundColor: "#fafafa" }}
            itemStyle={{
              justifyContent: "flex-start",
            }}
            dropDownStyle={{ backgroundColor: "#fafafa" }}
            placeholderStyle={{
              textAlign: "left",
              color: "gray",
              fontFamily: "kanitRegular",
            }}
            placeholder={"- โปรดเลือก -"}
            labelStyle={{
              textAlign: "left",
              color: "#000",
              fontFamily: "kanitRegular",
            }}
            arrowColor={"white"}
            arrowSize={15}
            arrowStyle={{
              backgroundColor: "#02d483",
              borderRadius: 15,
              color: "white",
            }}
            defaultValue={
              objSearch.bank_name == "" ? null : objSearch.bank_code
            }
            onChangeItem={(item) => onChangeBank(item)}
          />
        </Block>

        {/* Date */}
        <Block style={styles.container2}>
          <Block row>
            <Block flex>
              <Text
                style={{
                  alignSelf: "flex-start",
                  fontFamily: "kanitRegular",
                  fontSize: 18,
                  color: "black",
                  marginBottom: 5,
                }}
              >
                วันที่ :
              </Text>
              <Input
                right
                color="black"
                style={styles.search}
                value={objSearch.transfer_date}
                iconContent={
                  <TouchableOpacity onPress={showDatePicker}>
                    <Icons name="calendar-range" size={20} color="black" />
                  </TouchableOpacity>
                }
              />
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
              />
            </Block>
            <Block flex>
              <Text
                style={{
                  alignSelf: "flex-start",
                  fontFamily: "kanitRegular",
                  fontSize: 18,
                  color: "black",
                  marginBottom: 5,
                }}
              >
                เวลา :
              </Text>
              <Input
                right
                color="black"
                style={styles.search}
                value={objSearch.transfer_time}
                iconContent={
                  <TouchableOpacity onPress={showTimePicker}>
                    <Icons name="clock" size={20} color="black" />
                  </TouchableOpacity>
                }
              />
              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleConfirmTime}
                onCancel={hideTimePicker}
                is24Hour={true}
              />
            </Block>
          </Block>

          <Block row style={{ marginBottom: 5 }}>
            <Text
              style={{
                alignSelf: "flex-start",
                fontFamily: "kanitRegular",
                fontSize: 18,
                color: "black",
              }}
            >
              จำนวนเงินที่โอน :
            </Text>
          </Block>
          <Block style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder={"กรุณาใส่จำนวนเงินที่ทำการโอน"}
              placeholderTextColor="#808080"
              keyboardType="number-pad"
              value={objSearch.money_transfer}
              onChangeText={onChangeTransferMoney}
            />
          </Block>
        </Block>

        {/* Upload  */}
        <TouchableOpacity style={{ paddingLeft: "5%" }} onPress={pickImage}>
          <Block style={{ alignSelf: "center" }}>
            <Text
              style={{
                color: "black",
                fontFamily: "kanitRegular",
                fontSize: 17,
                textAlign: "center",
              }}
            >
              หลักฐานการโอนเงิน :
            </Text>
            <Block
              style={{
                backgroundColor: "#00c2f7",
                borderRadius: 50,
                height: 45,
                width: 220,
                marginTop: 15,
              }}
            >
              <Block
                row
                style={{
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "kanitRegular",
                    fontSize: 20,
                    marginTop: 10,
                    textAlign: "center",
                  }}
                >
                  อัพโหลดสลิป
                </Text>
                <Icons
                  name="upload"
                  size={20}
                  color="white"
                  style={{
                    marginTop: 14,
                    marginLeft: 15,
                  }}
                />
              </Block>
            </Block>
          </Block>
        </TouchableOpacity>
        <Block
          style={{
            height: 40,
            width: "95%",
            alignSelf: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
          }}
        ></Block>

        {/* Button */}
        <Block row style={{ paddingTop: 40, paddingBottom: 40 }}>
          <Button
            titleStyle={{ color: "white", fontFamily: "kanitRegular" }}
            title={formatTr("CANCEL").toString()}
            type="solid"
            onPress={() => props.navigation.navigate("Flash Sale")}
            containerStyle={styles.blockButton1}
            buttonStyle={styles.buttonStyle1}
          />
          <Button
            titleStyle={{ color: "white", fontFamily: "kanitRegular" }}
            title={formatTr("PAYMENT_NOTIFICATION").toString()}
            type="solid"
            containerStyle={styles.blockButton2}
            buttonStyle={styles.buttonStyle2}
            onPress={onPaymentTransfer}
          />
        </Block>

        <WangdekInfo />
      </ScrollView>
      <ModalLoading loading={loading} />
    </>
  );
}

export default connect(
  null,
  ActionPaymentNotifications.actions
)(PaymentNotifications);

const styles = StyleSheet.create({
  container2: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 25,
    paddingLeft: 25,
  },
  buttonStyle1: {
    backgroundColor: "#595959",
    borderRadius: 20,
    width: 150,
    alignSelf: "center",
  },
  buttonStyle2: {
    backgroundColor: "#11d1a5",
    borderRadius: 20,
    width: 150,
    alignSelf: "center",
  },
  blockStyle: {
    paddingTop: 20,
    paddingLeft: 25,
    alignSelf: "flex-start",
  },
  blockButton1: {
    flexDirection: "row",
    paddingLeft: 25,
  },
  blockButton2: {
    paddingLeft: 40,
  },
  search: {
    height: 40,
    width: width - 48,
    alignSelf: "center",
    borderWidth: 1.5,
    borderRadius: 5,
  },
  inputText: {
    height: 50,
    color: "black",
    fontSize: 15,
    fontFamily: "kanitRegular",
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
  inputViewDateTime: {
    width: "90%",
    backgroundColor: "#ffffff",
    height: 40,
    justifyContent: "center",
    marginTop: 7.5,
    borderWidth: 1.4,
    borderColor: "#e0e0e0",
  },
  search: {
    height: 40,
    width: "90%",
    justifyContent: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderRadius: 1,
  },
});
