import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import axios from "axios";
import moment from "moment";
import "moment-duration-format";
import "moment/locale/th";
import "moment/locale/en-au";
import { Block, Text, theme } from "galio-framework";
import { connect, useSelector } from "react-redux";
import * as ActionCart from "../../actions/action-cart/ActionCart";
import WangdekInfo from "../../components/WangdekInfo";
import NumericInput from "react-native-numeric-input";
import { Button } from "react-native-elements";
import commaNumber from "comma-number";
import { API_URL } from "../../config/config.app";
import { getToken } from "../../store/mock/token";
import ModalLoading from "../../components/ModalLoading";

const { height, width } = Dimensions.get("screen");
const token = getToken();
const rootImage = "http://10.0.1.37:8080";

const defaultCartListOrders = [
  {
    cart_id: 1,
    product_id: 3,
    product_name_th: "เสื้อผ้า 001",
    product_name_en: "Clothing 001",
    product_image: "/storage/3/images-%281%29.jfif",
    product_full_price: "600.00",
    product_price: 450,
    quantity: 1,
    flash_sales_id: 1,
    flash_sale_events_id: 1,
    disabled: false,
    remark: "",
  },
];

function CartScreen(props) {
  const locale = useSelector(({ i18n }) => i18n.lang);
  if (locale === "th") {
    moment.locale("th");
  } else {
    moment.locale("en-au");
  }
  const [loading, setLoading] = useState(null);
  // const { objCartScreen } = useSelector((state) => ({
  //   objCartScreen: state.actionCart.objCartScreen,
  // }));

  useEffect(() => {
    loadCartLists();
  }, []);

  const [listCarts, setListCarts] = useState(defaultCartListOrders);
  const loadCartLists = async () => {
    setLoading(true);
    await axios({
      method: "GET",
      url: API_URL.ADD_CART_ORDER_LISTVIEW_API,
      headers: {
        Accept: "*/*",
        Authorization: "Bearer " + (await token),
        "Content-Type": "application/json",
      },
    })
      .then(function (response) {
        setListCarts(response.data.data);
        setLoading(false);
        // props.setListTrCartScreen(response.data.data)
        // console.log(listTrCartScreen)
      })
      .catch(function (error) {
        setLoading(true);
        console.log(false);
      });
  };

  const renderCartLists = ({ item }) => {
    const onChangeNumericInputValue = (value) => {
      let oldlst = listCarts.filter((key) => key.product_id != item.product_id);
      let newlst = listCarts.filter((key) => key.product_id == item.product_id);
      newlst[0].quantity = value;

      let newStateObj = newlst.concat(oldlst).sort(function (a, b) {
        return a.cart_id - b.cart_id;
      });

      setListCarts(newStateObj);
    };
    return (
      <Block style={styles.blockProduct} key={item.cart_id}>
        <Block row>
          <Block style={styles.blockSemiImage}>
            <Image
              source={{ uri: rootImage + item.product_image }}
              style={styles.imageProduct}
            />
          </Block>
          <Block style={styles.blockSemiImage2}>
            <Block style={{ height: "55%", width: "78%" }}>
              <Text style={styles.fontTitleProduct}>
                {locale == "th" ? item.product_name_th : item.product_name_en}
              </Text>
            </Block>
            {/* quantity */}
            <Block row>
              <Text style={styles.detailText}>จำนวน : </Text>
              <NumericInput
                initValue={item.quantity}
                // value={numericInputValue}
                onChange={onChangeNumericInputValue}
                totalWidth={110}
                totalHeight={35}
                iconSize={18}
                step={1}
                minValue={0}
                valueType="integer"
                type="plus-minus"
                rounded={false}
                textColor="black"
                iconStyle={{ color: "white" }}
                inputStyle={{ fontFamily: "kanitRegular" }}
                leftButtonBackgroundColor="#adadad"
                rightButtonBackgroundColor="#09db99"
                containerStyle={{
                  marginLeft: 20,
                  fontFamily: "kanitRegular",
                }}
              />
            </Block>
          </Block>
        </Block>
        <Block row style={{ width: "90%", alignSelf: "center" }}>
          <Block style={{ width: "40%", alignSelf: "center" }}>
            <Text style={styles.fontPriceProductFullPrice}>
              ฿{commaNumber(parseFloat(item.product_full_price).toFixed(2))}
            </Text>
          </Block>
          <Block style={{ width: "40%", alignSelf: "center" }}>
            <Text style={styles.fontPriceProduct}>
              ฿{commaNumber(parseFloat(item.product_price).toFixed(2))}
            </Text>
          </Block>
          <Block style={{ marginLeft: 25 }}>
            <TouchableOpacity
              onPress={() => {
                console.log("Delete");
              }}
            >
              <Image
                source={require("../../assets/images/order-filter/delete-icon.png")}
                style={{ height: 35, width: 35, borderRadius: 25 }}
              />
            </TouchableOpacity>
          </Block>
        </Block>
      </Block>
    );
  };

  const onChangeOrderPage = () => {
    props.setListTrCartScreen(listCarts);
    props.navigation.navigate("Order Screen");
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <TouchableOpacity onPress={() => props.navigation.navigate("Home")}>
          <Block row style={styles.container}>
            <Text
              style={{
                color: "black",
                fontFamily: "kanitRegular",
                fontSize: 18,
              }}
            >
              {"<  "}ตะกร้าสินค้า
            </Text>
          </Block>
        </TouchableOpacity>

        {/* Product List */}
        <SafeAreaView>
          <FlatList
            data={listCarts}
            style={styles.containers}
            renderItem={renderCartLists}
            numColumns={1}
            keyExtractor={(item) => item.cart_id.toString()}
          />
        </SafeAreaView>

        {/* Button */}
        <Block
          row
          style={{ paddingTop: 40, paddingBottom: 40, alignSelf: "center" }}
        >
          <Button
            titleStyle={{ color: "white", fontFamily: "kanitRegular" }}
            title={"ซื้อสินค้าเพิ่มเติม"}
            type="solid"
            containerStyle={styles.blockButton1}
            buttonStyle={styles.buttonStyle1}
            onPress={() => props.navigation.navigate("Home")}
          />
          <Button
            titleStyle={{ color: "white", fontFamily: "kanitRegular" }}
            title={"ดำเนินการต่อ"}
            type="solid"
            containerStyle={styles.blockButton2}
            buttonStyle={styles.buttonStyle2}
            onPress={onChangeOrderPage}
          />
        </Block>

        <WangdekInfo />
      </ScrollView>
      <ModalLoading loading={loading} />
    </>
  );
}

export default connect(null, ActionCart.actions)(CartScreen);

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
  containers: {
    flex: 1,
    marginVertical: 20,
  },
  blockProduct: {
    backgroundColor: "#ededed",
    width: width,
    height: height / 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  blockSemiImage: {
    margin: 15,
  },
  blockSemiImage2: {
    margin: 10,
  },
  imageProduct: {
    width: 120,
    height: 100,
  },
  fontTitleProduct: {
    fontFamily: "kanitRegular",
    fontSize: 17,
    color: "black",
  },
  fontPriceProduct: {
    fontFamily: "kanitRegular",
    fontSize: 22,
    color: "black",
  },
  fontPriceProductFullPrice: {
    fontFamily: "kanitRegular",
    fontSize: 18,
    color: "#8f8f8f",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    textDecorationColor: "red",
  },
  blockButton1: {
    flexDirection: "row",
  },
  blockButton2: {
    paddingLeft: 25,
  },
  buttonStyle1: {
    backgroundColor: "#0a86c4",
    borderRadius: 20,
    width: 150,
    alignSelf: "center",
  },
  buttonStyle2: {
    backgroundColor: "#0ac980",
    borderRadius: 20,
    width: 150,
    alignSelf: "center",
  },
});

//Style Modal
const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    backgroundColor: "#00000099",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  modalContainer: {
    backgroundColor: "#f9fafb",
    width: "80%",
    borderRadius: 13,
  },
  modalHeader: {},
  title: {
    fontWeight: "bold",
    fontSize: 20,
    padding: 15,
    color: "#000",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "lightgray",
  },
  modalBody: {
    backgroundColor: "#fff",
    paddingVertical: 25,
    paddingHorizontal: 10,
  },
  modalFooter: {},
  actions: {
    borderRadius: 5,
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionText: {
    color: "#fff",
  },
  bloxStyle: {
    marginTop: 10,
  },
});
