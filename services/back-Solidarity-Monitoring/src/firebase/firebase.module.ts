import { Module, Global } from '@nestjs/common';
import { firestore, firebaseAuth } from './firebase.config'
import { FirebaseService } from './firebase.service';
import { FirestoreConnectionService } from './firestore-connection.service';

@Global()
@Module({providers: [
    {
      provide: 'FIRESTORE',
      useValue: firestore,
    },
    {
      provide: 'FIREBASE_AUTH',
      useValue: firebaseAuth,
    },
    FirebaseService,
    FirestoreConnectionService
  ],
  exports: ['FIRESTORE', 'FIREBASE_AUTH', FirestoreConnectionService],})
export class FirebaseModule {}
