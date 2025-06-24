import { activateRequest, makeMovement } from '@/services/pedidos.service';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

export default function GuardarScreen() {
  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Botón 1: Guardar cantidades iniciales */}
      <TouchableOpacity 
        className="flex-1 mb-4 bg-blue-500 rounded-lg shadow-md justify-center items-center"
        onPress={() => Alert.alert('Guardar cantidades iniciales', 'Esta acción guardará las cantidades iniciales')}
      >
        <Text className="text-white text-xl font-bold">Guardar cantidades iniciales</Text>
        <Text className="text-white text-sm mt-2">Presiona para registrar las cantidades al inicio</Text>
      </TouchableOpacity>

      {/* Botón 2: Enviar pedido */}
      <TouchableOpacity 
        className="flex-1 mb-4 bg-green-500 rounded-lg shadow-md justify-center items-center"
        onPress={() =>activateRequest().then(()=>{
          Alert.alert('Pedido enviado')
        }).catch(()=> Alert.alert('Error enviando el pedido')) }
      >
        <Text className="text-white text-xl font-bold">Enviar pedido al almacén</Text>
        <Text className="text-white text-sm mt-2">Presiona para enviar el pedido completo</Text>
      </TouchableOpacity>

      {/* Botón 3: Guardar cantidades finales */}
      <TouchableOpacity 
        className="flex-1 mb-4 bg-red-500 rounded-lg shadow-md justify-center items-center"
        onPress={() => Alert.alert('Guardar cantidades finales', 'Esta acción guardará las cantidades finales')}
      >
        <Text className="text-white text-xl font-bold">Guardar cantidades finales</Text>
        <Text className="text-white text-sm mt-2">Presiona para registrar las cantidades al finalizar</Text>
      </TouchableOpacity>
      {/* Botón 4: Despachar pedido */}

       <TouchableOpacity 
        className="flex-1 mb-4 bg-green-400 rounded-lg shadow-md justify-center items-center"
        onPress={() =>makeMovement().then(()=> Alert.alert('Movimiento realizado')).catch(()=> Alert.alert('El movimiento no se ha realizado'))}
      >
        <Text className="text-white text-xl font-bold">Dar salida a este pedido hacia el área</Text>
        <Text className="text-white text-sm mt-2">Presiona para registrar la salida</Text>
      </TouchableOpacity>
    </View>
  );
}