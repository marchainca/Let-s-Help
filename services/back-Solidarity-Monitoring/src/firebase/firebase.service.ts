import { Injectable, Inject } from '@nestjs/common';
import { log } from 'console';
import { Firestore, query, where } from 'firebase/firestore';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

@Injectable()
export class FirebaseService {
  constructor(@Inject('FIRESTORE') private firestore: Firestore) {}

  async createDocument(collectionName: string, data: any): Promise<string> {
    const colRef = collection(this.firestore, collectionName);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  }

  async getDocuments(collectionName: string): Promise<any[]> {
    const colRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    await updateDoc(docRef, data);
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    await deleteDoc(docRef);
  }

  /* 
  * field, campo a consultar
  * value, valor de la consulta
  * collectionName, collección a la cual se debe consultar
   */
  async findUserByField(field: string, value: string, collectionName: string ): Promise<any[]> {
    try {
      console.log(field)
      const colRef = collection(this.firestore, collectionName);
      const qry = query(colRef, where(field, '==', value)); 
      //console.log("antes del snapshot", qry)
      const snapshot = await getDocs(qry); 
      /* console.log("antes del return", snapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
      }) 
      ); */
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log("Error findUserByField", error);
      throw error;
    }
   
  }
}
