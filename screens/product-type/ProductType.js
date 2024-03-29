import React, { useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Dimensions,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import moment from "moment";
import "moment-duration-format";
import "moment/locale/th";
import "moment/locale/en-au";
import { actions as ActionProduct } from "../../actions/action-product/ActionProduct";
import { actions as ActionProductType } from "../../actions/action-product-type/ActionProductType";
import { Block, Text, theme } from "galio-framework";
import { formatTr } from "../../i18n/I18nProvider";
import WangdekInfo from "../../components/WangdekInfo";
import { API_URL } from "../../config/config.app";
import { getToken } from "../../store/mock/token";
import commaNumber from "comma-number";
import ModalLoading from "../../components/ModalLoading";

const { width } = Dimensions.get("screen");
let token = getToken();
const rootImage = "http://demo-ecommerce.am2bmarketing.co.th";

const defaultListProductType = [
  {
    id: 3,
    name_th: "เสื้อผ้า 001",
    name_en: "Clothing 001",
    image: "/storage/3/images-%281%29.jfif",
    price: "500.00",
    total_quantity: "3",
  },
];

function ProductType(props) {
  var LOAD_MORE = formatTr("LOAD_MORE").toString();
  const locale = useSelector(({ i18n }) => i18n.lang);
  if (locale === "th") {
    moment.locale("th");
  } else {
    moment.locale("en-au");
  }
  const { objProductActivity } = useSelector((state) => ({
    objProductActivity: state.actionProduct.objProductActivity,
  }));
  const { objProductType, listTrProductType } = useSelector((state) => ({
    objProductType: state.actionProductType.objProductType,
    listTrProductType: state.actionProductType.listTrProductType,
  }));

  const [loading, setLoading] = useState(null);
  const [stateObj, setStateObj] = useState(defaultListProductType);

  useEffect(() => {
    loadDataProductListType();
  }, [listTrProductType]);

  const loadDataProductListType = async () => {
    // setStateObj("");
    if (objProductType.TABS_TYPE == true) {
      setStateObj(listTrProductType);
    } else if (objProductType.HOME_TYPE == true) {
      setLoading(true);
      await axios
        .get(objProductType.API_TYPE, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + (await token),
            "Content-Type": "application/json",
            "X-localization": locale,
          },
          params: {
            page: 1,
          },
        })
        .then(function (response) {
          setLoading(false);
          setStateObj(response.data.data.product_lists);
        })
        .catch(function (error) {
          setLoading(false);
          console.log(error);
        });
    } else {
      setLoading(false);
    }
    setLoading(false);
  };
  const renderProduct = ({ item }) => {
    return (
      <Block flex style={styles.textContainerBlock1}>
        <TouchableOpacity onPress={() => onSelectProduct(item)}>
          <ImageBackground
            source={{
              uri: rootImage + item.image,
            }}
            style={styles.imageProduct}
          ></ImageBackground>
          <Block style={styles.productText}>
            <Block flex space="between" style={styles.productDescription}>
              <Text
                style={{
                  color: "black",
                  fontFamily: "kanitRegular",
                  fontSize: 15,
                  height:25
                }}
              >
                {locale == "th" ? item.name_th : item.name_en}
              </Text>
              <Block
                style={{ borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}
              ></Block>
              <Text
                style={{
                  color: "black",
                  fontFamily: "kanitRegular",
                  fontSize: 16,
                }}
              >
                ราคา : ฿{commaNumber(parseFloat(item.price).toFixed(2))}
              </Text>
            </Block>
          </Block>
        </TouchableOpacity>
      </Block>
    );
  };
  const [numList, setNumList] = useState(2);
  const onLoadMoreProduct = async () => {
    setNumList(numList + 1);
    if (objProductType.TABS_TYPE == true) {
      setLoading(true);
      await axios
        .get(
          objProductType.PRODUCT_TYPE === "TYPES"
            ? API_URL.CATEGORY_PRODUCT_SEARCH_API + objProductType.ITEM_ID
            : API_URL.BRANDS_PRODUCT_LISTVIEW_API +
                objProductType.ITEM_ID +
                "/products",
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            params: {
              page: numList,
            },
          }
        )
        .then(function (response) {
          setLoading(false);
          const newConcatState = stateObj.concat(response.data.data);
          setStateObj(newConcatState);
        })
        .catch(function (error) {
          setLoading(false);
          console.log(error);
        });
    } else if (objProductType.HOME_TYPE == true) {
      setLoading(true);
      await axios
        .get(objProductType.API_TYPE, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          params: {
            page: numList,
          },
        })
        .then(function (response) {
          setLoading(false);
          const newConcatState = stateObj.concat(
            response.data.data.product_lists
          );
          setStateObj(newConcatState);
        })
        .catch(function (error) {
          setLoading(false);
          console.log(error);
        });
    } else {
      setLoading(false);
    }
    setLoading(false);
  };

  const onSelectProduct = (product) => {
    let newObj = Object.assign({}, objProductActivity);
    newObj.TITLE = product.title;
    newObj.IMAGE = product.image;
    newObj.PRICE = product.price;
    newObj.DETAIL = product.detail;
    newObj.TOTAL_PRICE = product.price;
    newObj.COUNT = 1;
    newObj.FLASHSALE = false;
    props.setObjProductActivity(newObj);
    props.navigation.navigate("Products", { params: product });
  };
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <SectionList
          stickySectionHeadersEnabled={false}
          sections={PRODUCT_TYPE_LIST}
          renderSectionHeader={() => (
            <>
              {/* Title */}
              {objProductType.ITEM_NAME !== "" ? (
                <TouchableOpacity
                  onPress={() => props.navigation.navigate("Sign In")}
                >
                  <Block
                    row
                    style={{
                      paddingTop: 20,
                      paddingLeft: 20,
                      backgroundColor: "white",
                    }}
                  >
                    <Text
                      style={{
                        color: "black",
                        fontFamily: "kanitRegular",
                        fontSize: 25,
                      }}
                    >
                      {objProductType.ITEM_NAME}
                    </Text>
                  </Block>
                </TouchableOpacity>
              ) : (
                <Block style={{ padding: 5 }} />
              )}

              {/* Filter */}
              <Block row style={{ marginLeft: 10, marginTop: 10 }}>
                <Image
                  style={{ width: 35, height: 35 }}
                  source={require("../../assets/iconSignIn/filter-1.png")}
                />
                <TouchableOpacity
                  style={{ marginTop: 2 }}
                  onPress={() => props.navigation.navigate("Filter Search")}
                >
                  <Block row style={styles.search}>
                    <Text
                      style={{
                        color: "#7d7d7d",
                        fontFamily: "kanitRegular",
                        fontSize: 15,
                        marginTop: 5,
                        marginLeft: 10,
                      }}
                    >
                      {"ตัวกรอง"}
                    </Text>

                    <Image
                      style={{
                        marginLeft: "67%",
                        width: 34,
                        height: 34,
                      }}
                      source={require("../../assets/iconSignIn/filter-2.png")}
                    />
                  </Block>
                </TouchableOpacity>
              </Block>

              {/* ListItem */}
              <FlatList
                data={stateObj}
                style={styles.containers}
                renderItem={renderProduct}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
              />

              {/* Load More */}
              <TouchableOpacity
                onPress={onLoadMoreProduct}
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
  setObjProductActivity: ActionProduct.setObjProductActivity,
  clearObjProductActivity: ActionProduct.clearObjProductActivity,

  setObjProductType: ActionProductType.setObjProductType,
  clearObjProductType: ActionProductType.clearObjProductType,
  setListTrProductType: ActionProductType.setListTrProductType,
  pushListTrProductType: ActionProductType.pushListTrProductType,
};

export default connect(null, mapActions)(ProductType);

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
    marginRight: 10,
    elevation: 1,
  },
  imageProduct: {
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
  search: {
    height: 35,
    width: width - 70,
    alignSelf: "flex-end",
    borderWidth: 1.5,
    borderRadius: 1,
    backgroundColor: "#f0f0f0",
    borderColor: "#f0f0f0",
    marginLeft: 10,
  },
});

const PRODUCT_TYPE_LIST = [
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
