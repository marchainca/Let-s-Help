import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { BarChart } from 'react-native-chart-kit';

const IndicatorsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulación de llamada a la API
    setTimeout(() => {
      setData({
        progress: {
          currentMonth: 0.64,
          lastMonth: 0.4,
          semester: 0.9,
        },
        performance: [20, 45, 28, 80, 99, 43],
        budget: [
          { id: '1', name: 'Vivian Melissa', amount: 1300.5, image: 'https://via.placeholder.com/50' },
          { id: '2', name: 'Fraiber Melo', amount: 720.25, image: 'https://via.placeholder.com/50' },
          { id: '3', name: 'Erika Fonseca', amount: 420.83, image: 'https://via.placeholder.com/50' },
        ],
      });
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderProgressCircle = (progress, color, label) => (
    <View style={styles.progressItem}>
      <View style={styles.circleContainer}>
        <ProgressCircle
          style={styles.progressCircle}
          progress={progress}
          progressColor={color}
          strokeWidth={6}
          backgroundColor="#f0f0f0"
        />
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
    </View>
  );

  return (
    <FlatList
      data={data.budget}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          {/* Título Principal */}
          <Text style={styles.title}>Indicadores</Text>
          <Text style={styles.sectionTitle}>Avances Actividades</Text>

          {/* Contenedor de Progresos */}
          <View style={styles.progressContainer}>
            {renderProgressCircle(data.progress.currentMonth, '#4caf50', 'Mes Actual')}
            {renderProgressCircle(data.progress.lastMonth, '#f44336', 'Mes Pasado')}
            {renderProgressCircle(data.progress.semester, '#2196f3', 'Semestre')}
          </View>

          {/* Gráfica de Rendimiento */}
          <Text style={styles.sectionTitle}>Rendimiento</Text>
          <BarChart
            data={{
              labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
              datasets: [{ data: data.performance }],
            }}
            width={350}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#f9f9f9',
              backgroundGradientTo: '#f9f9f9',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={{ marginBottom: 20 }}
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.budgetItem}>
          <Image source={{ uri: item.image }} style={styles.budgetImage} />
          <View style={styles.budgetTextContainer}>
            <Text style={styles.budgetName}>{item.name}</Text>
            <Text style={styles.budgetAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        </View>
      )}
      nestedScrollEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    marginLeft: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  progressItem: {
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    height: 80,
    width: 80,
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  progressLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  budgetImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#ddd',
  },
  budgetTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
});

export default IndicatorsScreen;
