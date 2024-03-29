import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axios from "axios";
import moment from "moment";
import "moment-duration-format";
import "moment/locale/th";
import "moment/locale/en-au";
import { Block, Text, theme } from "galio-framework";
import { connect, useSelector } from "react-redux";
import * as ActionOrder from "../../../actions/action-order-status/ActionOrder";
import WangdekInfo from "../../../components/WangdekInfo";
import { Button } from "react-native-elements";
import { RadioButton } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { API_URL } from "../../../config/config.app";
import { getToken } from "../../../store/mock/token";
import ModalLoading from "../../../components/ModalLoading";

const { height, width } = Dimensions.get("screen");
const token = getToken();

function UseAddressDelivery(props) {
  const locale = useSelector(({ i18n }) => i18n.lang);
  if (locale === "th") {
    moment.locale("th");
  } else {
    moment.locale("en-au");
  }
  const [loading, setLoading] = useState(null);
  const [checkedDelivery, setCheckedDelivery] = useState("address");
  const { objUseAddressDelivery } = useSelector((state) => ({
    objUseAddressDelivery: state.actionOrder.objUseAddressDelivery,
  }));

  useEffect(() => {
    setCheckedDelivery("address");
    onLoadUserDelivery();
    getProvinces();
  }, []);

  const [province, setProvince] = useState([
    {
      label: objUseAddressDelivery.PROVINCE_NAME_ORDER,
      value: objUseAddressDelivery.PROVINCE_CODE_ORDER,
    },
  ]);
  const [district, setDistrict] = useState([
    {
      label: objUseAddressDelivery.DISTRICT_NAME_ORDER,
      value: objUseAddressDelivery.DISTRICT_CODE_ORDER,
    },
  ]);
  const [subDistrict, setSubDistrict] = useState([
    {
      label: objUseAddressDelivery.SUB_DISTRICT_NAME_ORDER,
      value: objUseAddressDelivery.SUB_DISTRICT_CODE_ORDER,
    },
  ]);
  async function onLoadUserDelivery() {
    setLoading(true);
    let newObj = Object.assign({}, objUseAddressDelivery);
    await axios
      .get(API_URL.USER_INFO_API, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + (await token),
        },
      })
      .then(async (response) => {
        newObj.FIRST_NAME = response.data.data.first_name;
        newObj.LAST_NAME = response.data.data.last_name;
        newObj.EMAIL = response.data.data.email;
        newObj.ADDRESS_NAME_ORDER =
          response.data.data.address_deliveries[0].address;

        newObj.province_id_deliveries =
          response.data.data.address_deliveries[0].province_id;
        newObj.district_id_deliveries =
          response.data.data.address_deliveries[0].district_id;
        newObj.sub_district_id_deliveries =
          response.data.data.address_deliveries[0].sub_district_id;
        newObj.PHONE_NUMBER_ORDER =
          response.data.data.address_deliveries[0].telephone;
        newObj.ZIP_CODE_ORDER =
          response.data.data.address_deliveries[0].postcode;

        //Addres 1 Original no edit
        newObj.FIRST_NAME_ORIGINAL = newObj.FIRST_NAME;
        newObj.LAST_NAME_ORIGINAL = newObj.LAST_NAME;
        newObj.EMAIL_ORIGINAL = newObj.EMAIL;
        newObj.PHONE_NUMBER_ORDER_ORIGINAL = newObj.PHONE_NUMBER_ORDER;
        newObj.ADDRESS_NAME_ORDER_ORIGINAL = newObj.ADDRESS_NAME_ORDER;

        //District
        await axios
          .get(API_URL.DISTRICT_API, {
            params: {
              province_id: newObj.province_id_deliveries,
            },
          })
          .then(async (response) => {
            let newlstDistrict = await response.data.data.find(
              (item) => item.id == parseInt(newObj.district_id_deliveries)
            );
            newObj.DISTRICT_CODE_ORDER = newlstDistrict.id;
            newObj.DISTRICT_NAME_ORDER = newlstDistrict.name_th.toString();

            newObj.DISTRICT_CODE_ORDER_ORIGINAL = newObj.DISTRICT_CODE_ORDER;
            newObj.DISTRICT_NAME_ORDER_ORIGINAL = newObj.DISTRICT_NAME_ORDER;

            //Sub-District
            await axios
              .get(API_URL.SUB_DISTRICT_API, {
                params: {
                  district_id: newObj.district_id_deliveries,
                },
              })
              .then(async (response) => {
                let newlstSubDistrict = await response.data.data.find(
                  (item) =>
                    item.id == parseInt(newObj.sub_district_id_deliveries)
                );
                newObj.SUB_DISTRICT_CODE_ORDER = newlstSubDistrict.id;
                newObj.SUB_DISTRICT_NAME_ORDER = newlstSubDistrict.name_th.toString();
                newObj.ZIP_CODE_ORDER = newlstSubDistrict.zip_code.toString();

                newObj.SUB_DISTRICT_CODE_ORDER_ORIGINAL =
                  newObj.SUB_DISTRICT_CODE_ORDER;
                newObj.SUB_DISTRICT_NAME_ORDER_ORIGINAL =
                  newObj.SUB_DISTRICT_NAME_ORDER;
                newObj.ZIP_CODE_ORDER_ORIGINAL = newObj.ZIP_CODE_ORDER;

                //Province
                await axios.get(API_URL.PROVINCE_API).then(async(response) => {
                  let newlstProvince = await response.data.data.find(
                    (item) => item.id == parseInt(newObj.province_id_deliveries)
                  );
                  newObj.PROVINCE_CODE_ORDER = newlstProvince.id;
                  newObj.PROVINCE_NAME_ORDER = (newlstProvince.name_th).toString();

                  newObj.PROVINCE_CODE_ORDER_ORIGINAL =
                    newObj.PROVINCE_CODE_ORDER;
                  newObj.PROVINCE_NAME_ORDER_ORIGINAL =
                    newObj.PROVINCE_NAME_ORDER;
                  props.setObjUseAddressDelivery(newObj);
                });
              });
          });
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
    setLoading(false);
  }
  const getProvinces = async () => {
    await axios
      .get(API_URL.PROVINCE_API)
      .then(function (response) {
        let newlstBin = response.data.data.map(function (item) {
          item.label = item.name_th;
          item.value = item.id;
          return item;
        });
        if (newlstBin !== null || newlstBin !== "") {
          setProvince(newlstBin);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const onChangeAdress = (value) => {
    let newObj = Object.assign({}, objUseAddressDelivery);
    newObj.ADDRESS_NAME_ORDER = value;
    props.setObjUseAddressDelivery(newObj);
  };
  const onChangeProvince = (item) => {
    let newObj = Object.assign({}, objUseAddressDelivery);
    newObj.PROVINCE_CODE_ORDER = item.value;
    newObj.PROVINCE_NAME_ORDER = item.label;
    props.setObjUseAddressDelivery(newObj);
    if (item.value !== null) {
      axios
        .get(API_URL.DISTRICT_API, {
          params: {
            province_id: item.id,
          },
        })
        .then(function (response) {
          let newlstBin = response.data.data.map(function (item) {
            item.label = item.name_th;
            item.value = item.id;
            return item;
          });
          setDistrict(newlstBin);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };
  const onChangeDistrict = (item) => {
    let newObj = Object.assign({}, objUseAddressDelivery);
    newObj.DISTRICT_CODE_ORDER = item.value;
    newObj.DISTRICT_NAME_ORDER = item.label;
    props.setObjUseAddressDelivery(newObj);
    if (item !== null) {
      axios
        .get(API_URL.SUB_DISTRICT_API, {
          params: {
            district_id: item.id,
          },
        })
        .then(function (response) {
          let newlstBin = response.data.data.map(function (item) {
            item.label = item.name_th;
            item.value = item.id;
            return item;
          });
          setSubDistrict(newlstBin);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };
  const onChangeSubDistrict = (item) => {
    let newObj = Object.assign({}, objUseAddressDelivery);
    newObj.SUB_DISTRICT_CODE_ORDER = item.value;
    newObj.SUB_DISTRICT_NAME_ORDER = item.label;
    newObj.ZIP_CODE_ORDER = item.zip_code.toString();
    props.setObjUseAddressDelivery(newObj);
  };
  const onChangeFirstName = (value) => {
    let newObj = Object.assign({}, objUseAddressDelivery);
    newObj.FIRST_NAME = value;
    props.setObjUseAddressDelivery(newObj);
  };
  const onChangePhoneNumber = (value) => {
    let newObj = Object.assign({}, objUseAddressDelivery);
    newObj.PHONE_NUMBER_ORDER = value;
    props.setObjUseAddressDelivery(newObj);
  };

  const onSelectAddressThis = () => {
    let objAddress = Object.assign({}, objUseAddressDelivery);
    if (checkedDelivery === "address") {
      objAddress.FIRST_NAME = objUseAddressDelivery.FIRST_NAME_ORIGINAL;
      objAddress.LAST_NAME = objUseAddressDelivery.LAST_NAME_ORIGINAL;
      objAddress.ADDRESS_NAME_ORDER =
        objUseAddressDelivery.ADDRESS_NAME_ORDER_ORIGINAL;
      objAddress.PHONE_NUMBER_ORDER =
        objUseAddressDelivery.PHONE_NUMBER_ORDER_ORIGINAL;

      objAddress.EMAIL = objUseAddressDelivery.EMAIL_ORIGINAL;
      objAddress.DISTRICT_CODE_ORDER =
        objUseAddressDelivery.DISTRICT_CODE_ORDER_ORIGINAL;
      objAddress.DISTRICT_NAME_ORDER =
        objUseAddressDelivery.DISTRICT_NAME_ORDER_ORIGINAL;
      objAddress.SUB_DISTRICT_CODE_ORDER =
        objUseAddressDelivery.SUB_DISTRICT_CODE_ORDER_ORIGINAL;
      objAddress.SUB_DISTRICT_NAME_ORDER =
        objUseAddressDelivery.SUB_DISTRICT_NAME_ORDER_ORIGINAL;
      objAddress.PROVINCE_CODE_ORDER =
        objUseAddressDelivery.PROVINCE_CODE_ORDER_ORIGINAL;
      objAddress.PROVINCE_NAME_ORDER =
        objUseAddressDelivery.PROVINCE_NAME_ORDER_ORIGINAL;
      objAddress.ZIP_CODE_ORDER = objUseAddressDelivery.ZIP_CODE_ORDER_ORIGINAL;
    }
    props.setObjUseAddressDelivery(objAddress);
    props.navigation.navigate("Order Screen");
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <TouchableOpacity
          onPress={() => props.navigation.navigate("Order Screen")}
        >
          <Block row style={styles.container}>
            <Text
              style={{
                color: "black",
                fontFamily: "kanitRegular",
                fontSize: 18,
              }}
            >
              {"<  "}ที่อยู่ในการจัดส่ง
            </Text>
          </Block>
        </TouchableOpacity>

        {/* Datial */}
        <Block style={{ backgroundColor: "white" }}>
          <Text style={styles.fontTitleProduct}>เลือกที่อยู่ในการจัดส่ง</Text>
          <RadioButton.Group
            onValueChange={(value) => setCheckedDelivery(value)}
            value={checkedDelivery}
          >
            {/* Address 1 */}
            <Block
              style={
                checkedDelivery === "address"
                  ? styles.blockRadioAddress
                  : styles.blockRadioAddressWhite
              }
            >
              <Block row style={{ marginLeft: 10, marginTop: 5 }}>
                <RadioButton color="red" value={"address"} />
                <Text style={styles.fontTitleProducts}>ที่อยู่โปรไฟล์</Text>
              </Block>
              <Block style={{ marginTop: 15 }}>
                <Text style={styles.textDescAddress}>
                  ชื่อ :{" "}
                  {objUseAddressDelivery.FIRST_NAME_ORIGINAL +
                    " " +
                    objUseAddressDelivery.LAST_NAME_ORIGINAL}
                </Text>
                <Text style={styles.textDescAddress}>
                  เบอร์โทร : {objUseAddressDelivery.PHONE_NUMBER_ORDER_ORIGINAL}
                </Text>
                <Text style={styles.textDescAddress}>
                  ที่อยู่ : {objUseAddressDelivery.ADDRESS_NAME_ORDER_ORIGINAL}{" "}
                  {objUseAddressDelivery.DISTRICT_NAME_ORDER_ORIGINAL}{" "}
                  {objUseAddressDelivery.SUB_DISTRICT_NAME_ORDER_ORIGINAL}{" "}
                  {objUseAddressDelivery.PROVINCE_NAME_ORDER_ORIGINAL}{" "}
                  {objUseAddressDelivery.ZIP_CODE_ORDER_ORIGINAL}
                </Text>
              </Block>
            </Block>
            {/* Address 2 */}
            <Block
              style={
                checkedDelivery === "fix_address"
                  ? styles.blockRadioAddressFix
                  : styles.blockRadioAddressFixWhite
              }
            >
              <Block row style={{ marginLeft: 10, marginTop: 5 }}>
                <RadioButton color="red" value={"fix_address"} />
                <Text style={styles.fontTitleProducts}>
                  แก้ไขที่อยู่ที่ต้องการจัดส่ง
                </Text>
              </Block>
              <Block style={{ marginTop: 15 }}>
                <Block style={{ marginBottom: 5 }}>
                  <Text style={styles.textDescAddress}>ชื่อ :</Text>
                  <Block style={styles.inputView}>
                    <TextInput
                      style={styles.inputText}
                      placeholder={""}
                      placeholderTextColor="#808080"
                      value={
                        objUseAddressDelivery.FIRST_NAME +
                        " " +
                        objUseAddressDelivery.LAST_NAME
                      }
                      onChangeText={onChangeFirstName}
                      editable={checkedDelivery == "address" ? false : true}
                    />
                  </Block>
                </Block>
                <Block style={{ marginBottom: 5 }}>
                  <Text style={styles.textDescAddress}>เบอร์โทร :</Text>
                  <Block style={styles.inputView}>
                    <TextInput
                      style={styles.inputText}
                      placeholder={""}
                      placeholderTextColor="#808080"
                      value={objUseAddressDelivery.PHONE_NUMBER_ORDER}
                      onChangeText={onChangePhoneNumber}
                      keyboardType="phone-pad"
                      editable={checkedDelivery == "address" ? false : true}
                    />
                  </Block>
                </Block>
                <Block style={{ marginBottom: 5 }}>
                  <Text style={styles.textDescAddress}>ที่อยู่ :</Text>
                  <Block style={styles.inputView}>
                    <TextInput
                      style={styles.inputText}
                      value={objUseAddressDelivery.ADDRESS_NAME_ORDER}
                      onChangeText={onChangeAdress}
                      editable={checkedDelivery == "address" ? false : true}
                    />
                  </Block>
                </Block>
                {/* Country */}
                <Block style={{ marginBottom: 5 }}>
                  <Text style={styles.textDescAddress}>จังหวัด :</Text>
                  <DropDownPicker
                    items={province}
                    containerStyle={{
                      height: 35,
                      width: width - 58,
                      alignSelf: "center",
                    }}
                    style={{ backgroundColor: "#f0f0f0" }}
                    itemStyle={{
                      justifyContent: "flex-start",
                    }}
                    dropDownStyle={{ backgroundColor: "#f0f0f0" }}
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
                    arrowSize={18}
                    arrowStyle={{
                      backgroundColor: "#02d483",
                      borderRadius: 20,
                      color: "white",
                    }}
                    disabled={checkedDelivery == "address" ? true : false}
                    defaultValue={
                      objUseAddressDelivery.PROVINCE_NAME_ORDER == ""
                        ? null
                        : objUseAddressDelivery.PROVINCE_CODE_ORDER
                    }
                    onChangeItem={(item) => onChangeProvince(item)}
                  />
                </Block>
                <Block style={{ marginBottom: 5 }}>
                  <Text style={styles.textDescAddress}>เขต/อำเภอ :</Text>
                  <DropDownPicker
                    items={district}
                    containerStyle={{
                      height: 35,
                      width: width - 58,
                      alignSelf: "center",
                    }}
                    style={{ backgroundColor: "#f0f0f0" }}
                    itemStyle={{
                      justifyContent: "flex-start",
                    }}
                    dropDownStyle={{ backgroundColor: "#f0f0f0" }}
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
                    arrowSize={18}
                    arrowStyle={{
                      backgroundColor: "#02d483",
                      borderRadius: 20,
                      color: "white",
                    }}
                    disabled={checkedDelivery == "address" ? true : false}
                    defaultValue={
                      objUseAddressDelivery.DISTRICT_NAME_ORDER == ""
                        ? null
                        : objUseAddressDelivery.DISTRICT_CODE_ORDER
                    }
                    onChangeItem={(item) => onChangeDistrict(item)}
                  />
                </Block>
                <Block style={{ marginBottom: 5 }}>
                  <Text style={styles.textDescAddress}>แขวง/ตำบล :</Text>
                  <DropDownPicker
                    items={subDistrict}
                    containerStyle={{
                      height: 35,
                      width: width - 58,
                      alignSelf: "center",
                    }}
                    style={{ backgroundColor: "#f0f0f0" }}
                    itemStyle={{
                      justifyContent: "flex-start",
                    }}
                    dropDownStyle={{ backgroundColor: "#f0f0f0" }}
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
                    arrowSize={18}
                    arrowStyle={{
                      backgroundColor: "#02d483",
                      borderRadius: 20,
                      color: "white",
                    }}
                    disabled={checkedDelivery == "address" ? true : false}
                    defaultValue={
                      objUseAddressDelivery.SUB_DISTRICT_NAME_ORDER == ""
                        ? null
                        : objUseAddressDelivery.SUB_DISTRICT_CODE_ORDER
                    }
                    onChangeItem={(item) => onChangeSubDistrict(item)}
                  />
                </Block>
                {/* ZipCode */}
                <Block style={{ marginBottom: 5 }}>
                  <Text style={styles.textDescAddress}>รหัสไปรษณีย์ :</Text>
                  <Block style={styles.inputView}>
                    <TextInput
                      style={styles.inputText}
                      value={objUseAddressDelivery.ZIP_CODE_ORDER}
                      editable={false}
                      editable={checkedDelivery == "address" ? false : true}
                    />
                  </Block>
                </Block>
              </Block>
            </Block>
          </RadioButton.Group>
        </Block>

        {/* Button */}
        <Block
          style={{
            paddingTop: 25,
            paddingBottom: 40,
            alignSelf: "center",
            backgroundColor: "white",
            width: width,
          }}
        >
          <Button
            titleStyle={{ color: "white", fontFamily: "kanitRegular" }}
            title={"ตกลง"}
            type="solid"
            buttonStyle={styles.buttonStyle1}
            onPress={onSelectAddressThis}
          />
        </Block>
        <WangdekInfo />
      </ScrollView>

      <ModalLoading loading={loading} />
    </>
  );
}

export default connect(null, ActionOrder.actions)(UseAddressDelivery);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.BUTTON_COLOR,
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  fontTitleProduct: {
    paddingLeft: 12,
    paddingBottom: 10,
    fontFamily: "kanitRegular",
    fontSize: 17,
    color: "black",
    marginLeft: 10,
    marginTop: 10,
  },
  fontTitleProducts: {
    paddingLeft: 12,
    paddingBottom: 10,
    fontFamily: "kanitRegular",
    fontSize: 18,
    color: "black",
    marginLeft: 10,
    marginTop: 5,
  },
  textDescAddress: {
    fontFamily: "kanitRegular",
    fontSize: 14,
    color: "#6e6d6d",
    paddingLeft: 20,
    paddingBottom: 5,
  },
  buttonStyle1: {
    backgroundColor: "#02d483",
    borderRadius: 20,
    width: 150,
    alignSelf: "center",
  },
  blockRadioAddress: {
    width: "95%",
    backgroundColor: "#f7f7f7",
    height: 180,
    alignSelf: "center",
    borderWidth: 0.2,
    borderColor: "gray",
    marginBottom: 10,
  },
  blockRadioAddressWhite: {
    width: "95%",
    backgroundColor: "white",
    height: 180,
    alignSelf: "center",
    borderWidth: 0.2,
    borderColor: "gray",
    marginBottom: 10,
  },
  blockRadioAddressFix: {
    width: "95%",
    backgroundColor: "#f7f7f7",
    height: height / 1.5,
    alignSelf: "center",
    borderWidth: 0.2,
    borderColor: "gray",
    marginBottom: 10,
  },
  blockRadioAddressFixWhite: {
    width: "95%",
    backgroundColor: "white",
    height: height / 1.5,
    alignSelf: "center",
    borderWidth: 0.2,
    borderColor: "gray",
    marginBottom: 10,
  },
  textTitleDelivery: {
    color: "black",
    fontFamily: "kanitBold",
    fontSize: 18,
  },
  textDescDelivery: {
    color: "black",
    fontFamily: "kanitRegular",
    fontSize: 15,
  },
  inputView: {
    width: "90%",
    backgroundColor: "#f0f0f0",
    height: 20,
    justifyContent: "center",
    alignSelf: "center",
    padding: 15,
    borderWidth: 1.2,
    borderColor: "#e0e0e0",
  },
  inputText: {
    height: 30,
    color: "black",
    fontSize: 14,
    fontFamily: "kanitRegular",
  },
});
