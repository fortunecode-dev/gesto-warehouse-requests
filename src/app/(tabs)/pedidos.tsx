import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getActiveRequests } from "@/services/pedidos.service";
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";

interface ActiveRequest {
  id: string;
  areaName: string;
  areaId:string;
  employeeName: string;
  productCount: number;
  createdAt: string;
}

export default function ActiveRequestsScreen() {
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { colors } = useTheme();

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Cargar pedidos activos
  const loadActiveRequests = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const requests = await getActiveRequests();
      setActiveRequests(requests);
    } catch (error) {
      console.error("Error loading active requests:", error);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Manejar selección de pedido
  const handleSelectRequest = async (requestId: string,areaId:string) => {
    try {
      await AsyncStorage.setItem('requestId', requestId);
      await AsyncStorage.setItem('selected', areaId);
      router.push({ pathname: "/checkout" })
    } catch (error) {
      console.error("Error selecting request:", error);
    }
  };

  // Cargar datos iniciales
   useFocusEffect(useCallback(() => {
        loadActiveRequests();
    }, []));
    
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.headerTitle, { color: colors.primary }]}>
        Pedidos Activos
      </Text>

      <FlatList
        data={activeRequests}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={() => loadActiveRequests(true)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay pedidos activos</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.requestCard}
            onPress={() => handleSelectRequest(item.id,item.areaId)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.areaText}>{item.areaName}</Text>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
            
            <Text style={styles.employeeText}>Responsable: {item.employeeName}</Text>
            
            <View style={styles.footer}>
              <View style={styles.productCountContainer}>
                <MaterialIcons name="shopping-cart" size={18} color="#555" />
                <Text style={styles.productCountText}>{item.productCount} productos</Text>
              </View>
              
              <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  areaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  employeeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCountText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});