import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirestoreConnectionService } from 'src/firebase/firestore-connection.service';


@Injectable()
export class FirestoreSchedulerService {
  constructor(private readonly firestoreService: FirestoreConnectionService) {}

  //@Cron('0 */5 * * * *') // Ejecutar cada 5 minutos
  async checkFirestoreConnection() {
    try {
      console.log('Verificando conexión a Firestore...');
      await this.firestoreService.checkConnection();
    } catch (error) {
      console.error('Error de conexión detectado:', error.message || error);
    }
  }
}
