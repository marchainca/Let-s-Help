import { Injectable, BadRequestException } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { Report } from '../interfaces/interfaces';
import { errorResponse, formatDate } from 'src/tools/function.tools';
import { CreateReportDto } from './dtos/create-report.dto';

@Injectable()
export class ReportsService {
  
  private firestore: Firestore;
    
  constructor() { this.firestore = new Firestore(); };

  /**
   * Crea un nuevo reporte.
   * @param report Datos del reporte a crear.
   * @returns ID del reporte creado.
  */
  async createReport(report: CreateReportDto): Promise<Object> {
      try {
          const { identificacion, nombresApellidos, reporte, createdBy } = report;

          // Validar longitud del reporte
          if (reporte.length > 500) {
              throw await errorResponse('Error: The "report" field cannot exceed 500 characters.', "createReport");
          }

          // Guardar el reporte en Firestore
          const docRef = this.firestore.collection('reports').doc();
          await docRef.set({
          identificacion,
          nombresApellidos,
          reporte,
          createdBy,
          createdAt: new Date(),
          });

          return {id: docRef.id}; // Retorna el ID del reporte creado
      } catch (error) {
          throw error;
      }
      
  }

  /**
   * Busca reportes por identificación o nombres y apellidos.
   * @param searchTerm Término de búsqueda.
   * @returns Lista de reportes coincidentes.
  */
  async findReports(searchTerm: string): Promise<Report[]> {
      try {
        if (!searchTerm) {
          throw await errorResponse('Error: You must provide a search term.', 'findReports');
        }
    
        // Realizar consultas a Firestore
        const reportsRef = this.firestore.collection('reports');
        const snapshotByIdentificacion = await reportsRef
          .where('identificacion', '>=', searchTerm)
          .where('identificacion', '<=', searchTerm + '\uf8ff')
          .get();
    
        const snapshotByName = await reportsRef
          .where('nombresApellidos', '>=', searchTerm)
          .where('nombresApellidos', '<=', searchTerm + '\uf8ff')
          .get();
    
        // Combinar resultados y eliminar duplicados
        const results = [
          ...snapshotByIdentificacion.docs,
          ...snapshotByName.docs,
        ].map(doc => {
          const data = doc.data() as Report;
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? formatDate(data.createdAt._seconds): null,
          };
        });
    
        console.log('Resultados de los reportes: ', results);
    
        const uniqueResults = Array.from(new Map(results.map(r => [r.id, r])).values());
        return uniqueResults;
      } catch (error) {
        throw error;
      }
    }

  /**
   * Lista los últimos 10 reportes creados, ordenados por fecha de creación (descendente).
   * @returns Lista de los últimos 10 reportes.
   */
  async listRecentReports(): Promise<Report[]> {
      try {
          const reportsRef = this.firestore.collection('reports');
          
          // Consulta para obtener los últimos 10 reportes
          const snapshot = await reportsRef
              .orderBy('createdAt', 'desc') // Ordenar por fecha de creación (descendente)
              //.limit(10) // Limitar a los 10 más recientes
              .get();
      
          if (snapshot.empty) {
              console.log('No se encontraron reportes recientes.');
              return [];
          }
      
          // Extraer los datos de los documentos
          const results = snapshot.docs.map(doc => {
              const data = doc.data() as Report;
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? formatDate(data.createdAt._seconds): null,
              };
            });
      
          return results;
      } catch (error) {
          console.error('Error al listar los reportes recientes:', error);
          throw error;
      }
  }
  
}

