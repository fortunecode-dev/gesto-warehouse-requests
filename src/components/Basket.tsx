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
  ScrollView,
  Pressable,
  ActivityIndicator
} from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import { getProducts, getProductsSaved, syncProducts } from "@/services/pedidos.service";
import axios from "axios";
import { useFocusEffect } from "expo-router";

interface Producto {
  id: string;
  name: string;
  unitOfMeasureId: string;
  cantidad: string;
  stock?: number;
}

interface ProductoAgregado extends Producto {
  key: string;
  fechaAgregado: number;
}

type Orden = 'alfabetico' | 'insercion';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function Basket({ title, url }) {
  const { colors } = useTheme();
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [productosAgregados, setProductosAgregados] = useState<ProductoAgregado[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoAgregado | null>(null);
  const [nuevaCantidad, setNuevaCantidad] = useState('1');
  const [orden, setOrden] = useState<Orden>('insercion');
  const [indiceProductoActual, setIndiceProductoActual] = useState(0);
  const [isLastProduct, setIsLastProduct] = useState(false);
  const [categorias, setCategorias] = useState<any>([]);
  const [productos, setProductos] = useState<any>({});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    height > width ? 'portrait' : 'landscape'
  );
  const [placeholderValue, setPlaceholderValue] = useState('');
  
  
  // Cargar productos iniciales
   useFocusEffect(useCallback(() => {
       load();
    }, []));


  const load = async () => {
    try {
      const [productos, categorias] = await getProducts(url);
      setCategorias(categorias);
      setProductos(productos);

      // Cargar productos agregados desde el backend
      const response = await getProductsSaved(url)
      if (response && Array.isArray(response)) {
        setProductosAgregados(response.map(p => ({
          ...p,
          key: `${p.id}-${Date.now()}`,
          fechaAgregado: p.fechaAgregado || Date.now()
        })));
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  // Sincronizar productos con el backend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let successTimer: NodeJS.Timeout;

    const syncWithBackend = async () => {
      try {
        setSyncStatus('loading');
        await syncProducts(url, productosAgregados);
        setSyncStatus('success');
      } catch (error) {
        console.error("Error al sincronizar productos:", error);
        setSyncStatus('error');
        timer = setTimeout(syncWithBackend, 5000);
      }
    };

    timer = setTimeout(syncWithBackend, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(successTimer);
    };
  }, [productosAgregados, url]);

  const abrirModalEdicion = (producto: ProductoAgregado) => {
    const indice = productosAgregados.findIndex(p => p.key === producto.key);
    setIndiceProductoActual(indice);
    setProductoEditando(producto);
    
    // Modificación para el placeholder en modo checkout
    if (url === 'checkout') {
      const stockText = producto.stock !== undefined ? `Stock: ${producto.stock}` : '';
      setPlaceholderValue(`Pedido: ${producto.cantidad} ${stockText}`);
    } else {
      setPlaceholderValue(producto.cantidad);
    }
    
    setNuevaCantidad('');
    setModalVisible(true);
  };

  const guardarEdicion = () => {
    if (!productoEditando) return;

    const cantidadFinal = nuevaCantidad === '' ? placeholderValue : nuevaCantidad;
    const productosActualizados = productosAgregados.map(p =>
      p.key === productoEditando.key ? { ...p, cantidad: cantidadFinal } : p
    );

    setProductosAgregados(productosActualizados);
    setPlaceholderValue(cantidadFinal);
    setNuevaCantidad('');
    return productosActualizados;
  };

  const handleSubmitEditing = () => {
    const productosActualizados = guardarEdicion();

    if (!isLastProduct && productosActualizados) {
      const siguienteIndice = indiceProductoActual + 1;
      const siguienteProducto = productosActualizados[siguienteIndice];
      setIndiceProductoActual(siguienteIndice);
      setProductoEditando(siguienteProducto);
      
      // Modificación para el placeholder en modo checkout
      if (url === 'checkout') {
        const stockText = siguienteProducto.stock !== undefined ? `Stock: ${siguienteProducto.stock}` : '';
        setPlaceholderValue(`Pedido: ${siguienteProducto.cantidad} ${stockText}`);
      } else {
        setPlaceholderValue(siguienteProducto.cantidad);
      }
      
      setNuevaCantidad('');
    } else {
      setModalVisible(false);
    }
  };

  const siguienteProducto = () => {
    const productosActualizados = guardarEdicion();
    if (!productosActualizados || !productoEditando) return;

    let siguienteIndice = indiceProductoActual + 1;
    if (siguienteIndice >= productosActualizados.length) {
      siguienteIndice = 0;
    }

    const siguienteProducto = productosActualizados[siguienteIndice];
    setIndiceProductoActual(siguienteIndice);
    setProductoEditando(siguienteProducto);
    
    // Modificación para el placeholder en modo checkout
    if (url === 'checkout') {
      const stockText = siguienteProducto.stock !== undefined ? `Stock: ${siguienteProducto.stock}` : '';
      setPlaceholderValue(`Pedido: ${siguienteProducto.cantidad} ${stockText}`);
    } else {
      setPlaceholderValue(siguienteProducto.cantidad);
    }
    
    setNuevaCantidad('');
  };

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(height > width ? 'portrait' : 'landscape');
    };

    Dimensions.addEventListener('change', updateOrientation);
  }, []);

  useEffect(() => {
    setIsLastProduct(indiceProductoActual === productosAgregados.length - 1);
  }, [indiceProductoActual, productosAgregados]);

  const agregarProducto = (productoId: string) => {
    const productoExistenteIndex = productosAgregados.findIndex(p => p.id === productoId);

    if (productoExistenteIndex >= 0) {
      const productosActualizados = [...productosAgregados];
      const cantidadActual = parseInt(productosActualizados[productoExistenteIndex].cantidad) || 0;
      productosActualizados[productoExistenteIndex].cantidad = (cantidadActual + 1).toString();
      setProductosAgregados(productosActualizados);
      setSyncStatus('loading');
      return;
    }

    const producto = productos[selectedCategoria].find((p: any) => p.id === productoId);
    const nuevoProducto = {
      ...producto,
      cantidad: '1',
      key: `${productoId}-${Date.now()}`,
      fechaAgregado: Date.now()
    };

    setProductosAgregados(prev => [...prev, nuevoProducto]);
    setSyncStatus('loading');
  };

  const eliminarProducto = (key: string) => {
    setProductosAgregados(productosAgregados.filter((p:any) => (p.id||p.productId) !== key));
    setSyncStatus('loading');
  };

  const handleChangeText = (text: string) => {
    if (text === '' || /^\d+$/.test(text)) {
      setNuevaCantidad(text);
    }
  };

  const productosOrdenados = [...productosAgregados].sort((a, b) => {
    if (orden === 'alfabetico') {
      return a.name.localeCompare(b.name);
    } else {
      return a.fechaAgregado - b.fechaAgregado;
    }
  });

  const renderItem = ({ item }: { item: any }) => {
    // Determinar el color de fondo basado en stock y cantidad
    let backgroundColor = 'white';
    if (item.stock !== undefined) {
      const cantidad = parseInt(item.cantidad) || 0;
      const stock = parseInt(item.stock) || 0;
      backgroundColor = stock >= cantidad ? '#e8f5e9' : '#ffebee'; // Verde claro si hay stock, rojo claro si no
    }

    return (
      <View style={[styles.itemContainer, { backgroundColor }]}>
        <Pressable
          style={styles.itemInfo}
          onPress={() => abrirModalEdicion(item)}
        >
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCantidad}>
            {item.cantidad} {item.unitOfMeasureId}
            {item.stock !== undefined && ` (Stock: ${item.stock})`}
          </Text>
        </Pressable>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarProducto(item.id||item.productId)}
        >
          <MaterialIcons name="delete" size={isSmallDevice ? 20 : 24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };

  const productoYaAgregado = (productoId: string) => {
    return productosAgregados.some(p => p.id === productoId);
  };

  const renderSyncIndicator = () => {
    if (syncStatus === 'idle') return null;

    let indicatorColor = '#999';
    switch (syncStatus) {
      case 'loading':
        indicatorColor = '#3498db';
        break;
      case 'success':
        indicatorColor = '#2ecc71';
        break;
      case 'error':
        indicatorColor = '#e74c3c';
        break;
    }

    return (
      <View style={[styles.syncIndicator, { backgroundColor: indicatorColor }]}>
        {syncStatus === 'loading' ? (
          <ActivityIndicator size="small" color="white" />
        ) : syncStatus === 'error' ? (
          <MaterialIcons name="error" size={16} color="white" />
        ) : (
          <MaterialIcons name="check" size={16} color="white" />
        )}
      </View>
    );
  };

  const renderHeaderLeft = () => (
    <View style={styles.headerLeft}>
      <View style={styles.titleWrapper}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {renderSyncIndicator()}
      </View>
      <View style={styles.ordenButtons}>
        <TouchableOpacity
          style={[styles.ordenButton, orden === 'alfabetico' && styles.ordenButtonSelected]}
          onPress={() => setOrden(prev => prev === 'alfabetico' ? "insercion" : "alfabetico")}
        >
          <Text style={[styles.ordenButtonText, orden === 'alfabetico' && styles.ordenButtonTextSelected]}>
            Ordenar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={[
          styles.mainContainer,
          orientation === 'landscape' && styles.landscapeContainer
        ]}>
          {/* Columna 1 - Tabla de productos agregados */}
          <View style={[
            styles.leftContainer,
            orientation === 'landscape' && styles.landscapeLeftContainer
          ]}>
            {renderHeaderLeft()}

            {productosOrdenados.length > 0 ? (
              <FlatList
                data={productosOrdenados}
                renderItem={renderItem}
                keyExtractor={item => item.id ||item.productId}
                style={styles.listaContainer}
                contentContainerStyle={styles.listaContent}
              />
            ) : (
              <Text style={styles.emptyText}>No hay productos agregados</Text>
            )}
          </View>

          {/* Columna 2 - Productos */}
          <ScrollView
            style={[
              styles.middleContainer,
              orientation === 'landscape' && styles.landscapeMiddleContainer
            ]}
            contentContainerStyle={styles.middleContent}
          >
            {selectedCategoria && (
              <View style={styles.productosContainer}>
                <Text style={styles.sectionTitle}>Productos</Text>
                <FlatList
                  data={productos[selectedCategoria]}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.productoItem,
                        productoYaAgregado(item.id) && styles.productoItemAgregado,
                      ]}
                      onPress={() => agregarProducto(item.id)}
                    >
                      <Text style={styles.productoText}>{item.name}</Text>
                      <Text style={styles.productounitOfMeasureId}>{item.unitOfMeasureId}</Text>
                      {productoYaAgregado(item.id) && (
                        <MaterialIcons
                          name="check-circle"
                          size={isSmallDevice ? 18 : 20}
                          color="#2ecc71"
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.productosListContent}
                />
              </View>
            )}
          </ScrollView>

          {/* Columna 3 - Categorías */}
          <ScrollView
            style={[
              styles.rightContainer,
              orientation === 'landscape' && styles.landscapeRightContainer
            ]}
            contentContainerStyle={styles.rightContent}
          >
            <View style={styles.categoriasContainer}>
              <Text style={styles.sectionTitle}>Categorías</Text>
              <View style={styles.categoriasButtons}>
                {categorias.map((categoria) => (
                  <TouchableOpacity
                    key={categoria.id}
                    style={[
                      styles.categoriaButton,
                      selectedCategoria === categoria.id && styles.categoriaButtonSelected
                    ]}
                    onPress={() => {
                      setSelectedCategoria(categoria.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoriaButtonText,
                        selectedCategoria === categoria.id && styles.categoriaButtonTextSelected
                      ]}
                    >
                      {categoria.denomination}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Modal para editar cantidad */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={[
                styles.modalContent,
                orientation === 'landscape' && styles.landscapeModalContent
              ]}>
                <Text style={styles.modalTitle}>{productoEditando?.name}</Text>
                <Text style={styles.modalSubtitle}>Cantidad ({productoEditando?.unitOfMeasureId}):</Text>
                <TextInput
                  value={nuevaCantidad}
                  onChangeText={handleChangeText}
                  keyboardType="numeric"
                  style={styles.modalInput}
                  autoFocus
                  onSubmitEditing={handleSubmitEditing}
                  returnKeyType={isLastProduct ? "done" : "next"}
                  blurOnSubmit={false}
                  placeholder={placeholderValue}
                  placeholderTextColor="#999"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#e0e0e0' }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      {
                        backgroundColor: '#3498db',
                        opacity: isLastProduct ? 0.5 : 1
                      }
                    ]}
                    onPress={() => {
                      guardarEdicion();
                      if (!isLastProduct) {
                        siguienteProducto();
                      }
                    }}
                    disabled={isLastProduct}
                  >
                    <Text style={[styles.modalButtonText, { color: 'white' }]}>
                      Siguiente
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={guardarEdicion}
                  >
                    <Text style={[styles.modalButtonText, { color: 'white' }]}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeContainer: {
    flexDirection: 'row',
  },
  leftContainer: {
    width: '40%',
    padding: 15,
    borderRightWidth: 1,
    borderRightColor: '#dfe6e9',
  },
  landscapeLeftContainer: {
    width: '40%',
  },
  middleContainer: {
    width: '45%',
    padding: 15,
    borderRightWidth: 1,
    borderRightColor: '#dfe6e9',
  },
  landscapeMiddleContainer: {
    width: '45%',
  },
  rightContainer: {
    width: '15%',
    padding: 15,
  },
  landscapeRightContainer: {
    width: '15%',
  },
  middleContent: {
    paddingBottom: 20,
  },
  rightContent: {
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  syncIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordenButtons: {
    flexDirection: 'row',
    gap: 1,
  },
  ordenButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 105,
    backgroundColor: '#e0e0e0',
  },
  ordenButtonSelected: {
    backgroundColor: '#3498db',
  },
  ordenButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  ordenButtonTextSelected: {
    color: 'white',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 20,
    fontSize: 16,
  },
  listaContainer: {
    flex: 1,
  },
  listaContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 4,
  },
  itemCantidad: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  deleteButton: {
    marginLeft: 10,
  },
  categoriasContainer: {
    marginBottom: 20,
  },
  categoriasButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  categoriaButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  categoriaButtonSelected: {
    backgroundColor: '#3498db',
  },
  categoriaButtonText: {
    color: '#2c3e50',
    fontSize: 14,
  },
  categoriaButtonTextSelected: {
    color: 'white',
  },
  productosContainer: {
    flex: 1,
    marginBottom: 20,
  },
  productosListContent: {
    paddingBottom: 20,
  },
  productoItem: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    position: 'relative',
  },
  productoItemAgregado: {
    backgroundColor: '#f0fff4',
    borderColor: '#c8e6c9',
  },
  productoText: {
    fontSize: 16,
    color: '#34495e',
  },
  productounitOfMeasureId: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  checkIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  landscapeModalContent: {
    width: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 5,
    color: '#7f8c8d',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});