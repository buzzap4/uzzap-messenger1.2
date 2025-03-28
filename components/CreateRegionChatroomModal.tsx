import React, { useState } from 'react';
import { Modal, View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';

const regionsWithProvinces = [
  { region: 'REGION I - ILOCOS REGION', provinces: ['ILOCOS NORTE', 'ILOCOS SUR', 'LA UNION', 'PANGASINAN'] },
  { region: 'REGION II - CAGAYAN VALLEY', provinces: ['BATANES', 'CAGAYAN', 'ISABELA', 'NUEVA VIZCAYA', 'QUIRINO'] },
  { region: 'REGION III - CENTRAL LUZON', provinces: ['AURORA', 'BATAAN', 'BULACAN', 'NUEVA ECIJA', 'PAMPANGA', 'TARLAC', 'ZAMBALES'] },
  { region: 'REGION IV-A - CALABARZON', provinces: ['BATANGAS', 'CAVITE', 'LAGUNA', 'QUEZON', 'RIZAL'] },
  { region: 'REGION IV-B - MIMAROPA', provinces: ['MARINDUQUE', 'OCCIDENTAL MINDORO', 'ORIENTAL MINDORO', 'PALAWAN', 'ROMBLON'] },
  { region: 'REGION V - BICOL REGION', provinces: ['ALBAY', 'CAMARINES NORTE', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE', 'SORSOGON'] },
  { region: 'REGION VI - WESTERN VISAYAS', provinces: ['AKLAN', 'ANTIQUE', 'CAPIZ', 'GUIMARAS', 'ILOILO', 'NEGROS OCCIDENTAL'] },
  { region: 'REGION VII - CENTRAL VISAYAS', provinces: ['BOHOL', 'CEBU', 'NEGROS ORIENTAL', 'SIQUIJOR'] },
  { region: 'REGION VIII - EASTERN VISAYAS', provinces: ['BILIRAN', 'EASTERN SAMAR', 'LEYTE', 'NORTHERN SAMAR', 'SAMAR', 'SOUTHERN LEYTE'] },
  { region: 'REGION IX - ZAMBOANGA PENINSULA', provinces: ['ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY'] },
  { region: 'REGION X - NORTHERN MINDANAO', provinces: ['BUKIDNON', 'CAMIGUIN', 'LANAO DEL NORTE', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL'] },
  { region: 'REGION XI - DAVAO REGION', provinces: ['DAVAO DE ORO', 'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO OCCIDENTAL', 'DAVAO ORIENTAL'] },
  { region: 'REGION XII - SOCCSKSARGEN', provinces: ['COTABATO', 'SARANGANI', 'SOUTH COTABATO', 'SULTAN KUDARAT'] },
  { region: 'REGION XIII - CARAGA', provinces: ['AGUSAN DEL NORTE', 'AGUSAN DEL SUR', 'DINAGAT ISLANDS', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR'] },
  { region: 'BARMM', provinces: ['BASILAN', 'LANAO DEL SUR', 'MAGUINDANAO DEL NORTE', 'MAGUINDANAO DEL SUR', 'SULU', 'TAWI-TAWI'] },
];

export default function CreateRegionChatroomModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [selectedRegion, setSelectedRegion] = useState<string>(""); // Default to empty string
  const [provinceName, setProvinceName] = useState("");

  const seedRegionsAndProvinces = async () => {
    try {
      for (const { region, provinces } of regionsWithProvinces) {
        // Insert region
        const { data: regionData, error: regionError } = await supabase
          .from('regions')
          .upsert({ name: region }, { onConflict: 'name' })
          .select('id')
          .single();

        if (regionError) throw regionError;

        // Insert provinces
        const regionId = regionData.id;
        const provinceInserts = provinces.map((province) => ({ name: province, region_id: regionId }));
        const { error: provinceError } = await supabase.from('provinces').insert(provinceInserts);

        if (provinceError) throw provinceError;
      }

      Alert.alert('Success', 'Regions and provinces seeded successfully');
    } catch (error) {
      console.error('Error seeding regions and provinces:', error);
      Alert.alert('Error', 'Failed to seed regions and provinces');
    }
  };

  const handleCreate = async () => {
    try {
      if (!selectedRegion || !provinceName.trim()) {
        Alert.alert('Error', 'Please select a region and enter a province name');
        return;
      }

      Alert.alert('Info', 'Seeding regions and provinces...');
      await seedRegionsAndProvinces();
      onClose();
    } catch (error) {
      console.error('Error creating region/province:', error);
      Alert.alert('Error', 'Failed to create region or province');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seed Regions and Provinces</Text>
          <Picker
            selectedValue={selectedRegion}
            onValueChange={(itemValue: string) => setSelectedRegion(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Region" value="" />
            {regionsWithProvinces.map(({ region }) => (
              <Picker.Item key={region} label={region} value={region} />
            ))}
          </Picker>
          <TextInput
            placeholder="Province Name"
            value={provinceName}
            onChangeText={setProvinceName}
            style={styles.input}
          />
          <Button title="Seed Data" onPress={handleCreate} />
          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
});
