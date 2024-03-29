import React, { useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
  Dimensions,
} from "react-native";
import axios from "axios";
import moment from "moment";
import "moment-duration-format";
import "moment/locale/th";
import "moment/locale/en-au";
import { actions as ActionProduct } from "../actions/action-product/ActionProduct";
import { Block, Text, theme } from "galio-framework";
import { formatTr } from "../i18n/I18nProvider";
import WangdekInfo from "../components/WangdekInfo";
import { API_URL } from "../config/config.app";
import commaNumber from "comma-number";
import { getToken } from "../store/mock/token";
import ModalLoading from "../components/ModalLoading";

const { width } = Dimensions.get("screen");
const token = getToken();
const rootImage = "http://demo-ecommerce.am2bmarketing.co.th";

function HistoryView(props) {
  const locale = useSelector(({ i18n }) => i18n.lang);
  if (locale === "th") {
    moment.locale("th");
  } else {
    moment.locale("en-au");
  }
  
  var LOAD_MORE = formatTr("LOAD_MORE").toString();
  const [loading, setLoading] = useState(null);
  const { objProductActivity } = useSelector((state) => ({
    objProductActivity: state.actionProduct.objProductActivity,
  }));

  useEffect(() => {
    loadHistoryViewList();
  }, []);

  const [numList, setNumList] = useState(2);
  const [stateObj, setStateObj] = useState([
    {
      key: "1",
      title: "",
      detail: "",
      image: "1",
      price: "0",
      horizontal: true,
    },
  ]);
  async function loadHistoryViewList() {
    setLoading(true);
    await axios
      .get(API_URL.GET_HISTORY_VIEW_HD_API, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + (await token),
          "Content-Type": "application/json",
        },
        params: {
          page: 1,
        },
      })
      .then(function (response) {
        setStateObj(response.data.data.product_lists);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
    setLoading(false);
  }
  const loadMoreProductHistoryView = async () => {
    setLoading(true);
    setNumList(numList + 1);
    await axios
      .get(API_URL.GET_HISTORY_VIEW_HD_API, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + (await token),
          "Content-Type": "application/json",
        },
        params: {
          page: numList,
        },
      })
      .then(function (response) {
        const newConcatState = stateObj.concat(
          response.data.data.product_lists
        );
        setStateObj(newConcatState);
        setLoading(false);
      })
      .catch(function (error) {
        setLoading(false);
        console.log(error);
      });
    setLoading(false);
  };

  const renderProductHistoryView = ({ item }) => {
    const onSelectProductHistory = async (item) => {
      setLoading(true);
      await axios
        .get(API_URL.PRODUCT_SEARCH_HD_API + item.id, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + (await token),
            "Content-Type": "application/json",
          },
        })
        .then(function (response) {
          let newObj = Object.assign({}, objProductActivity);
          newObj.FLASHSALE = false;
          newObj.product_id = response.data.data.id;

          newObj.TITLE =
            locale == "th"
              ? response.data.data.name_th
              : response.data.data.name_en;
          if (locale == "th") {
            newObj.DETAIL = response.data.data.description_th;
          } else {
            newObj.DETAIL = response.data.data.description_en;
          }
          newObj.IMAGE = response.data.data.image;
          newObj.PRICE = response.data.data.price;
          newObj.product_full_price = response.data.data.full_price;
          newObj.stock = response.data.data.stock;
          newObj.quantity = 1;
          newObj.discount = 0;
          if (locale == "th") {
            newObj.product_info_th = response.data.data.info_th;
          } else {
            newObj.product_info_th = response.data.data.info_en;
          }
          newObj.product_favorite = response.data.data.favorite;

          props.setObjProductActivity(newObj);
          setLoading(false);

          props.navigation.navigate("Products");
        })
        .catch(function (error) {
          setLoading(false);
          console.log(error);
        });
    };
    return (
      <Block flex style={styles.textContainerBlock1}>
        <Image
          source={{
            uri: rootImage + item.image,
          }}
          style={styles.imageProduct}
        />
        <TouchableOpacity
          onPress={() => onSelectProductHistory(item)}
          style={styles.productText}
        >
          <Block flex space="between" style={styles.productDescription}>
            <Text
              style={{
                color: "black",
                fontFamily: "kanitRegular",
                fontSize: 13,
              }}
            >
              {locale == "th" ? item.name_th : item.name_en}
            </Text>
            <Text
              style={{
                color: "black",
                fontFamily: "kanitRegular",
                fontSize: 14,
              }}
            >
              ราคา : ฿{commaNumber(parseFloat(item.price).toFixed(2))}
            </Text>
          </Block>
        </TouchableOpacity>
      </Block>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <SectionList
          stickySectionHeadersEnabled={false}
          sections={HISTORY_VIEW_LIST}
          renderSectionHeader={() => (
            <>
              {/* Title */}
              <TouchableOpacity
                onPress={() => props.navigation.navigate("Sign In")}
              >
                <Block
                  row
                  style={{
                    paddingTop: 20,
                    paddingLeft: 20,
                    paddingBottom: 20,
                    backgroundColor: "white",
                    borderBottomWidth: 1,
                    borderBottomColor: "#e0e0e0",
                  }}
                >
                  <Text
                    style={{
                      color: "black",
                      fontFamily: "kanitRegular",
                      fontSize: 18,
                    }}
                  >
                    {"<  "}ประวัติการเข้าชม
                  </Text>
                </Block>
              </TouchableOpacity>
              {/* ListItem */}
              <FlatList
                data={stateObj}
                style={styles.containers}
                renderItem={renderProductHistoryView}
                numColumns={2}
              />
              <TouchableOpacity
                onPress={loadMoreProductHistoryView}
                style={{ marginBottom: 15 }}
              >
                <Text
                  style={styles.loadMoreText}
                  size={14}
                  color={theme.COLORS.PRIMARY}
                >
                  {LOAD_MORE + " >"}
                </Text>
              </TouchableOpacity>
            </>
          )}
          renderSectionFooter={() => <>{<WangdekInfo />}</>}
          renderItem={() => {
            return null;
          }}
        />
      </SafeAreaView>

      <ModalLoading loading={loading} />
    </>
  );
}

const mapActions = {
  //Product Detail
  setObjProductActivity: ActionProduct.setObjProductActivity,
  clearObjProductActivity: ActionProduct.clearObjProductActivity,
};

export default connect(null, mapActions)(HistoryView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "column",
  },
  containers: {
    flex: 1,
    marginVertical: 20,
  },
  textContainerBlock1: {
    padding: 10,
    flexWrap: "wrap",
    marginRight: 10,
  },
  imageProduct: {
    resizeMode: "cover",
    width: 180,
    height: 150,
  },
  productText: {
    width: 180,
    height: 100,
  },
  productDescription: {
    padding: theme.SIZES.BASE / 1.5,
    backgroundColor: "white",
    borderBottomEndRadius: 2,
    borderBottomLeftRadius: 2,
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  item: {
    backgroundColor: "#4D243D",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    margin: 5,
    height: width / 3, // approximate a square
  },
  itemInvisible: {
    backgroundColor: "transparent",
  },
  itemText: {
    color: "#fff",
  },
  loadMoreText: {
    alignSelf: "center",
    color: "black",
    fontFamily: "kanitRegular",
    borderBottomWidth: 5,
    borderBottomColor: "#ff002f",
    borderRadius: 2,
  },
});

const HISTORY_VIEW_LIST = [
  {
    title: "Mock",
    horizontal: false,
    data: [
      {
        key: "1",
        uri: "",
      },
    ],
  },
];
