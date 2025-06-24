import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Keyboard,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Pressable,
  ScrollView
} from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import { getProducts, getProductsSaved, syncProducts } from "@/services/pedidos.service";
import { useFocusEffect } from "expo-router";

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const leftWidth = screenWidth * 0.4;   // 40%
const middleWidth = screenWidth * 0.3; // 30%
const rightWidth = screenWidth * 0.3;  // 30%
const itemHeight = isSmallDevice ? 40 : 50; // Altura reducida de elementos
const standar={"mass":"kg","units":"u","volume":"mL","distance":"cm"}
export default function Basket({ title, url }) {
  const { colors } = useTheme();
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [nuevaCantidad, setNuevaCantidad] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState({});
  const [placeholderValue, setPlaceholderValue] = useState('');
  const [indiceProductoActual, setIndiceProductoActual] = useState(0);
  const [isLastProduct, setIsLastProduct] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      const [productosRes, categoriasRes] = await getProducts(url);
      setCategorias(categoriasRes);
      setProductos(productosRes);
      const saved = await getProductsSaved(url);
      if (Array.isArray(saved)) {
        setProductosAgregados(saved.map(p => ({
          ...p,
          id:p.productId,
          key: `${p.id||p.productId}-${Date.now()}`,
          fechaAgregado: p.fechaAgregado || Date.now()
        })));
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
  };

  const syncData = async () => {
    try {
      setSyncStatus('loading');
      await syncProducts(url, productosAgregados);
      setSyncStatus('success');
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    const timer = setTimeout(syncData, 1000);
    return () => clearTimeout(timer);
  }, [productosAgregados]);

  const abrirModalEdicion = (producto) => {
    const indice = productosAgregados.findIndex(p => p.key === producto.key);
    setIndiceProductoActual(indice);
    setProductoEditando(producto);
    setPlaceholderValue(producto.cantidad.toString());
    setNuevaCantidad('');
    setModalVisible(true);
  };

  const guardarEdicion = () => {
    if (!productoEditando) return;
    const cantidadFinal = nuevaCantidad || placeholderValue;
    const actualizados = productosAgregados.map(p =>
      p.key === productoEditando.key ? { ...p, cantidad: cantidadFinal } : p
    );
    setProductosAgregados(actualizados);
    return actualizados;
  };

  const siguienteProducto = () => {
    const actualizados = guardarEdicion();
    if (!actualizados || !productoEditando) return;

    let siguienteIndice = indiceProductoActual + 1;
    if (siguienteIndice >= actualizados.length) siguienteIndice = 0;

    const siguiente = actualizados[siguienteIndice];
    setIndiceProductoActual(siguienteIndice);
    setProductoEditando(siguiente);
    setPlaceholderValue(siguiente.cantidad);
    setNuevaCantidad('');
  };

  const agregarProducto = (id) => {
    const existe = productosAgregados.find(p => p.id === id);
    if (existe) {
      const actualizados = productosAgregados.map(p =>
        p.id === id ? { ...p, cantidad: String(parseFloat(p.cantidad) + 1) } : p
      );
      setProductosAgregados(actualizados);
    } else {
      const producto = productos[selectedCategoria].find(p => p.id === id);
      const nuevo = {
        ...producto,
        cantidad: '1',
        key: `${id}-${Date.now()}`,
        fechaAgregado: Date.now()
      };
      setProductosAgregados(prev => [...prev, nuevo]);
    }
  };

  const eliminarProducto = (id) => {
    setProductosAgregados(prev => prev.filter(p => p.id !== id));
  };

  const validarCantidadDecimal = (text) => {
    if (text === '' || /^\d*\.?\d{0,2}$/.test(text)) {
      setNuevaCantidad(text);
    }
  };

  const renderSyncIndicator = () => {
    let icon, color;
    switch (syncStatus) {
      case 'loading':
        icon = <ActivityIndicator size="small" color="white" />;
        color = '#3498db';
        break;
      case 'success':
        icon = <MaterialIcons name="check" size={16} color="white" />;
        color = '#2ecc71';
        break;
      case 'error':
        icon = <MaterialIcons name="error" size={16} color="white" />;
        color = '#e74c3c';
        break;
      default:
        return null;
    }
    return (
      <View style={[styles.syncIndicator, { backgroundColor: color }]}>
        {icon}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const stock = parseInt(item.stock) || 0;
    const bgColor = item.stock !== undefined ?
      (stock >= cantidad ? '#e8f5e9' : '#ffebee') : 'white';

    return (
      <View style={[styles.itemContainer, {
        backgroundColor: bgColor,
        height: itemHeight
      }]}>
        <Pressable
          style={styles.itemInfo}
          onPress={() => abrirModalEdicion(item)}
        >
          <Text
            style={styles.itemText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {cantidad}x {item.name} ({standar[item.unitOfMeasureId]})
          </Text>
          {item.stock !== undefined && (
            <Text style={styles.stockText}>
              Stock: {stock}
            </Text>
          )}
        </Pressable>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarProducto(item.id)}
        >
          <MaterialIcons
            name="delete"
            size={isSmallDevice ? 18 : 20}
            color="#e74c3c"
          />
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    setIsLastProduct(indiceProductoActual === productosAgregados.length - 1);
  }, [indiceProductoActual, productosAgregados]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {renderSyncIndicator()}
        </View>

        <View style={styles.columnsContainer}>
          {/* Columna izquierda - Productos agregados (40%) */}
          <View style={[styles.column, { width: leftWidth }]}>
            <FlatList
              data={productosAgregados}
              renderItem={renderItem}
              keyExtractor={item => item.id || item.productId}
              contentContainerStyle={styles.listContent}
            />
          </View>

          {/* Columna central - Productos (30%) */}
          <View style={[styles.column, { width: middleWidth }]}>
            {selectedCategoria && (
              <FlatList
                data={productos[selectedCategoria] || []}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.productoItem}
                    onPress={() => agregarProducto(item.id)}
                  >
                    <Text
                      style={styles.productoText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name} ({standar[item.unitOfMeasureId]})
                    </Text>
                   
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>

          {/* Columna derecha - Categorías (30%) */}
          <View style={[styles.column, { width: rightWidth }]}>
            <ScrollView contentContainerStyle={styles.categoriasContainer}>
              {categorias.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.categoriaBtn,
                    selectedCategoria === c.id && styles.categoriaBtnSelected
                  ]}
                  onPress={() => setSelectedCategoria(c.id)}
                >
                  <Text
                    style={[
                      styles.categoriaText,
                      selectedCategoria === c.id && styles.categoriaTextSelected
                    ]} 
                    numberOfLines={1} // Cambiado de 1 a 2 para permitir texto más largo
                  >
                    {c.denomination}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Modal de edición */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{productoEditando?.name}</Text>
              <Text style={styles.modalSubtitle}>
                Cantidad ({standar[productoEditando?.unitOfMeasureId]})
              </Text>
              <TextInput
                value={nuevaCantidad}
                onChangeText={validarCantidadDecimal}
                keyboardType="decimal-pad"
                style={styles.modalInput}
                placeholder={placeholderValue}
                placeholderTextColor="#999"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.nextBtn,
                    isLastProduct && styles.disabledBtn
                  ]}
                  onPress={siguienteProducto}
                  disabled={isLastProduct}
                >
                  <Text style={[styles.modalBtnText, styles.whiteText]}>
                    Siguiente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={() => {
                    guardarEdicion();
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalBtnText, styles.whiteText]}>
                    Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 10,
  },
  syncIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemInfo: {
    flex: 1,
    paddingVertical: 6,
  },
  itemText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#34495e',
  },
  stockText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  deleteButton: {
    padding: 6,
  },
  productoItem: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 40,
    justifyContent: 'center',
  },
  productoText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#2c3e50',
  },
  productoUnit: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#7f8c8d',
  },

  categoriaBtnSelected: {
    backgroundColor: '#3498db',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
  },
  nextBtn: {
    backgroundColor: '#3498db',
  },
  saveBtn: {
    backgroundColor: '#2ecc71',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  whiteText: {
    color: 'white',
  },

   categoriasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoriaBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 6,
    flexGrow:1
  },
  categoriaText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#2c3e50',
    textAlign: 'center',
    flexWrap: 'wrap', // Permite que el texto se ajuste
    flexShrink: 1, // Permite que el texto se reduzca si es necesario
  },
  categoriaTextSelected: {
    color: '#fff',
  },

});