import { Injectable, OnModuleInit } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class FirestoreConnectionService implements OnModuleInit {
  private firestore: Firestore;

  constructor() {
    this.firestore = new Firestore();
  }

  // Verificar la conexión al iniciar el módulo
  async onModuleInit() {
    // await this.checkConnection(); //Se comenta para no aumentar la cantidad de peticiones 
  }

  // Método para verificar la conexión a Firestore
  async checkConnection(): Promise<void> {
    try {
      // Realiza una operación simple (listar colecciones)
      const collections = await this.firestore.listCollections();
        console.log("collections", collections.map(col => col.id))
      if (collections.length > 0) {
        console.log('Conexión a Firestore establecida correctamente.');
      } else {
        console.log('Conexión establecida, pero no se encontraron colecciones.');
      }
    } catch (error) {
      console.error('Error al conectar con Firestore:', error.message || error);
      throw new Error('No se pudo establecer conexión con Firestore.');
    }
  }
}
