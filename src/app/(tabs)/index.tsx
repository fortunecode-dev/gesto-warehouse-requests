import { getAreas, getEmployes, getRequestId } from "@/services/pedidos.service";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Area {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  username: string;
}

export default function LocalScreen() {
  const [selectedLocal, setSelectedLocal] = useState<string>('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [responsables, setResponsables] = useState<Employee[]>([]);
  const [selectedResponsable, setSelectedResponsable] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const { colors } = useTheme();

  // Cargar datos iniciales y selecciones guardadas
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar locales
        const locals = await getAreas();
        setAreas(locals);
        
        // Cargar selecciones guardadas
        const savedLocal = await AsyncStorage.getItem('selectedLocal');
        const savedResponsable = await AsyncStorage.getItem('selectedResponsable');
        
        if (savedLocal) {
          setSelectedLocal(savedLocal);
          // Cargar empleados si hay un local guardado
          const employees = await getEmployes(savedLocal);
          setResponsables(employees);
          
          if (savedResponsable) {
            setSelectedResponsable(savedResponsable);
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Cargar empleados cuando cambia el local seleccionado
  useEffect(() => {
    const loadEmployees = async () => {
      if (!selectedLocal) return;
      
      try {
        setLoadingEmployees(true);
        const employees = await getEmployes(selectedLocal);
        setResponsables(employees);
        
        // Guardar local seleccionado
        await AsyncStorage.setItem('selectedLocal', selectedLocal);
        
        // Resetear responsable cuando cambia el local
        setSelectedResponsable('');
        await AsyncStorage.removeItem('selectedResponsable');
      } catch (error) {
        console.error("Error loading employees:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    loadEmployees();
  }, [selectedLocal]);

  // Guardar responsable seleccionado
  useEffect(() => {
    const saveResponsable = async () => {
      if (!selectedResponsable) return;
      
      try {
        await AsyncStorage.setItem('selectedResponsable', selectedResponsable);
      } catch (error) {
        console.error("Error saving responsable:", error);
      }
    };
    getRequestId(selectedResponsable,selectedLocal)
    saveResponsable();
  }, [selectedResponsable]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        Seleccione Local
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLocal}
          onValueChange={setSelectedLocal}
          style={styles.picker}
          dropdownIconColor={colors.primary}
        >
          <Picker.Item label="Seleccione un local..." value="" />
          {areas.map((local) => (
            <Picker.Item
              key={local.id}
              label={local.name}
              value={local.id}
            />
          ))}
        </Picker>
      </View>

      {selectedLocal && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Responsable
          </Text>
          <View style={styles.pickerContainer}>
            {loadingEmployees ? (
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <Picker
                selectedValue={selectedResponsable}
                onValueChange={setSelectedResponsable}
                style={styles.picker}
                dropdownIconColor={colors.primary}
              >
                <Picker.Item label="Seleccione un responsable..." value="" />
                {responsables.map((resp) => (
                  <Picker.Item 
                    key={resp.id} 
                    label={resp.username} 
                    value={resp.id} 
                  />
                ))}
              </Picker>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
});