import React, { useState, useEffect } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { BarChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../api/apiClient';

const PROGRESS_RING_SIZE = 80;

const ProgressRing = ({ progress, color, strokeWidth = 6 }) => {
  const radius = (PROGRESS_RING_SIZE - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = PROGRESS_RING_SIZE / 2;

  return (
    <Svg width={PROGRESS_RING_SIZE} height={PROGRESS_RING_SIZE}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#f0f0f0"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - progress)}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
};

const IndicatorsScreen = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    progress: { currentMonth: 0, lastMonth: 0, semester: 0 },
    performance: [],
    budget: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}dashboard/indicators`;
        const response = await apiFetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || t('common.serverResponseError'));
        }

        const result = await response.json();

        if (result.code === 1 && result.content) {
          setData({
            progress: result.content.progress || { currentMonth: 0, lastMonth: 0, semester: 0 },
            performance: result.content.performance || [],
            budget: result.content.budget || [],
          });
        } else {
          throw new Error(result.message || t('indicators.loadError'));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert(
          t('common.error'),
          t('indicators.loadFailed', { message: error.message })
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
        <ProgressRing progress={progress} color={color} strokeWidth={6} />
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
    </View>
  );

  const monthLabels = [
    t('indicators.months.jan'),
    t('indicators.months.feb'),
    t('indicators.months.mar'),
    t('indicators.months.apr'),
    t('indicators.months.may'),
    t('indicators.months.jun'),
  ];

  return (
    <FlatList
      data={data.budget}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>{t('indicators.title')}</Text>
          <Text style={styles.sectionTitle}>{t('indicators.activityProgress')}</Text>

          <View style={styles.progressContainer}>
            {renderProgressCircle(
              data.progress.currentMonth,
              '#4caf50',
              t('indicators.currentMonth')
            )}
            {renderProgressCircle(
              data.progress.lastMonth,
              '#f44336',
              t('indicators.lastMonth')
            )}
            {renderProgressCircle(
              data.progress.semester,
              '#2196f3',
              t('indicators.semester')
            )}
          </View>

          <Text style={styles.sectionTitle}>{t('indicators.performance')}</Text>
          <BarChart
            data={{
              labels: monthLabels,
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
      nestedScrollEnabled
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
