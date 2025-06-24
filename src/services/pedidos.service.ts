import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"

export const getProducts = async (url) => {
  try {
    const { data } = await axios.get(`http://localhost:4000/request/products`)
    return data
  } catch (error) {
    return []
    console.log(error)
  }

}
export const getRequestId = async (userId, areaId) => {
  try {
    const { data } = await axios.get(`http://localhost:4000/request/${userId}/${areaId}`)
    await AsyncStorage.setItem('requestId', data.id);
  } catch (error) {
    return ""
    console.log(error)
  }

}
export const getProductsSaved = async (url) => {
  try {
    const param = await AsyncStorage.getItem(url == "request" || url == "checkout" ? 'requestId' : "selectedLocal");
    const { data } = await axios.get(`http://localhost:4000/request/products/saved/${url}/${param}`)
    return data
  } catch (error) {
    return []
    console.log(error)
  }

}
export const getEmployes = async (areaId) => {
  try {
    const { data } = await axios.get(`http://localhost:4000/get-employes-by-area/${areaId}`)
    return data
  } catch (error) {
    return []
    console.log(error)
  }

}
export const getAreas = async () => {
  try {
    const { data } = await axios.get("http://localhost:4000/areas-local")
    return data
  } catch (error) {
    return []
    console.log(error)
  }
}

export const syncProducts = async (url: string, productos: any[]) => {
  try {
    const requestId = await AsyncStorage.getItem('requestId');
    const areaId = await AsyncStorage.getItem('selectedLocal');
    const response = await axios.post(`http://localhost:4000/request/sync/${url}`, { productos, requestId, areaId });
    return response.data;
  } catch (error) {
    return []
    throw error;
  }
};
export const activateRequest = async () => {
  try {
    const requestId = await AsyncStorage.getItem('requestId');
    const response = await axios.post(`http://localhost:4000/request/send-to-warehouse/${requestId}`);
    return response.data;
  } catch (error) {
    return []
    throw error;
  }
};

export const makeMovement = async () => {
  try {
    const requestId = await AsyncStorage.getItem('requestId');
    const response = await axios.post(`http://localhost:4000/request/make-movement/${requestId}`);
    return response.data;
  } catch (error) {
    return []
    throw error;
  }
};


export const getActiveRequests = async () => {
  try {
 const response = await axios.get(`http://localhost:4000/request/list`);
    return response.data;
   
  } catch (error) {
    return []
    throw error;
  }
};