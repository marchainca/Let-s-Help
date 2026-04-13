import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { errorResponse } from 'src/tools/function.tools';
import { UpdateActivityDto } from './dtos/update-activity.dto';

@Injectable()
export class ActivitiesService {
    private firestore: Firestore;

    constructor() {
      this.firestore = new Firestore();
    }
  
    /**
     * Obtiene el contenido de la colección 'programs' desde Firestore.
     * @returns Lista con los datos de todos los documentos en la colección 'programs'.
     */
    async getAllActivities(): Promise<any[]> {
      try {
        const programsRef = this.firestore.collection('programs');
        const snapshot = await programsRef.get();
  
        if (snapshot.empty) {
          console.log('No se encontraron documentos en la colección "programs".');
          return [];
        }
  
        // Mapear los documentos para devolver su contenido
        const programs = snapshot.docs.map(doc => ({
          id: doc.id, 
          ...doc.data(), 
        }));
  
        return programs;
      } catch (error) {
        console.error('Error al obtener los programas:', error);
        throw new Error('Error al obtener los programas.');
      }
    }

    /**
     * Obtiene la lista de los nombres de los programas.
     * @returns Lista con los nombres de los programas.
     */
    async getProgramNames(): Promise<string[]> {
        try {
        const programsRef = this.firestore.collection('programs');
        const snapshot = await programsRef.get();
    
        if (snapshot.empty) {
            console.log('No se encontraron documentos en la colección "programs".');
            return [];
        }
    
        // Extraer solo los nombres de los programas (IDs de los documentos)
        const programNames = snapshot.docs.map(doc => doc.id);
        return programNames;
        } catch (error) {
            console.error('Error al obtener los nombres de los programas:', error);
            throw error;
        }
    }

  /**
   * Obtiene las actividades asociadas a un programa específico.
   * @param programName Nombre del programa.
   * @returns Las actividades del programa solicitado.
   */
  async getProgramActivities(programName: string): Promise<any> {
      try {
          const programRef = this.firestore.collection('programs').doc(programName);
          const doc = await programRef.get();
      
          if (!doc.exists) {
              throw await errorResponse(`Error: The program "${programName}" does not exist.`, 'getProgramActivities');
          }
      
          // Retornar las actividades del programa
          return doc.data();
      } catch (error) {
          console.error('Error al obtener las actividades del programa:', error);
          throw error;
      }
  }


  // reestructuración de las colecciones y los documentos para los programas, subprogramas y actividades

  async createProgram(body: any): Promise<string>{
    try {
      const programRef = this.firestore.collection('programas').doc(); // Genera un ID automático
      await programRef.set({
        name: body.name,
        description: body.description,
        responsible: body.responsible
      });
    
      console.log('Programa creado con ID:', programRef.id);
      return programRef.id

    } catch (error) {
      console.error('Error al crear el programa:', error);
      throw error
    }

  }

  async createSubprogram(body: any): Promise<string>{
    try {
      // Obtenemos la referencia al documento del programa
      const programRef = this.firestore.collection('programas').doc(body.programId);
      // Creamos un nuevo documento en la subcolección "subprograms"
      const subprogramRef = programRef.collection('subprograms').doc();
      await subprogramRef.set({
        name: body.name,                       
        description: body.description
      });
    
      console.log('Subprograma creado con ID:', subprogramRef.id);
      return subprogramRef.id

    } catch (error) {
      console.error('Error al crear el programa:', error);
      throw error
    }

  }

  async createActivity(body: any): Promise<string> {
    try {
      // Referencia al documento de un subprograma específico
      const subprogramRef = this.firestore.collection('programas')
      .doc(body.programId)
      .collection('subprograms')
      .doc(body.subprogramId);

      // Referencia al documento de la actividad dentro de la colección 'activities'
      const activityRef = subprogramRef.collection('activities').doc();

      // Generar las actividades para cada una de las 4 semanas en un array
      const activitiesArray = [];
      for (let week = 1; week <= 4; week++) {
          activitiesArray.push({
              weekNumber: week,
              projectedActivities: body.activityData.projectedActivities,
              executedActivities: body.activityData.executedActivities,
              projectedAttendees: body.activityData.projectedAttendees,
              actualAttendees: body.activityData.actualAttendees,
              responsible: body.activityData.responsible
          });
      }

      // Crear el documento con el campo 'activities' como un array
      const activityData = {
          title: body.activityData.title,
          activities: activitiesArray
      };

      await activityRef.set(activityData);

      console.log('Actividad creada con ID:', activityRef.id);
      return activityRef.id;
    } catch (error) {
        console.error('Error al crear la actividad:', error);
        throw error;
    }
}


  /**
   * Obtiene el programa asociadas a un id.
   * @param id identificación del usuario.
   * @returns el programa del usuario.
   */
  async getPrograms(id: string): Promise<any> {
    try {

      const programById = this.firestore.collection('programas');
      const snapshot = await programById.where('responsible', '==', id).get();
    
      if (snapshot.empty) {
        throw await errorResponse(`Error: No programs linked to the id: ${id}`, 'getPrograms');
      }

      //console.log("data de snapshot", snapshot);

      // Obtener programas con subprogramas
      const programs = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const programData = doc.data();
          const subprogramsRef = doc.ref.collection('subprograms');
          const subprogramsSnapshot = await subprogramsRef.get();

          // Obtener nombres de los subprogramas
          const subprograms = subprogramsSnapshot.docs.map(subDoc => ({
            id: subDoc.id,
            name: subDoc.data().name,
          }));

          return {
            id: doc.id,
            ...programData,
            subprograms,
          };
        })
      );
    
      return programs;
    } catch (error) {
        console.error(`Error al obtener el programa para el id: ${id}` , error);
        throw error;
    }
  }

   /**
   * Obtiene las actividades asociadas a un subprograma específico dentro de un programa.
   * @param programId ID del programa principal.
   * @param subprogramId ID del subprograma.
   * @returns Lista de actividades del subprograma solicitado.
   */
   async getActivitiesBySubprogram(programId: string, subprogramId: string): Promise<any[]> {
    if (!programId || !subprogramId) {
      throw await errorResponse(`Error: You must provide a valid applet ID`, 'getActivitiesBySubprogram');
    }

    try {
      const programRef = this.firestore.collection('programas').doc(programId);
      const subprogramRef = programRef.collection('subprograms').doc(subprogramId);
      const activitiesRef = subprogramRef.collection('activities');

      const activitiesSnapshot = await activitiesRef.get();

      if (activitiesSnapshot.empty) {
        console.log(`No se encontraron actividades para el subprograma: ${subprogramId}`);
        return [];
      }

      // Extraer las actividades
      const activities = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return activities;
    } catch (error) {
      console.error('Error al obtener las actividades del subprograma:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de una semana específica dentro del array "activities".
   * @param updateActivityDto Objeto con los datos a actualizar.
   * @returns Mensaje de éxito si la actualización es exitosa.
   */
  async updateActivityWeek(updateActivityDto: UpdateActivityDto): Promise<string> {
    const { programId, subprogramId, activityId, weekNumber, ...updatedFields } = updateActivityDto;

    if (!programId || !subprogramId || !activityId || !weekNumber) {
      throw await errorResponse(`Error: ProgramId, subprogramId, activityId, and weekNumber are required for updating.`, 'updateActivityWeek');
    }

    try {
      // Referencia al documento de la actividad dentro del subprograma
      const activityRef = this.firestore.collection('programas')
        .doc(programId)
        .collection('subprograms')
        .doc(subprogramId)
        .collection('activities')
        .doc(activityId);

      // Obtener el documento actual
      const activityDoc = await activityRef.get();
      if (!activityDoc.exists) {
        throw await errorResponse(`Error: The activity with ID ${activityId} was not found.`, 'updateActivityWeek');
      }

      // Obtener el array de actividades
      const activityData = activityDoc.data();
      if (!activityData || !Array.isArray(activityData.activities)) {
        throw new Error('El documento no contiene un array de actividades válido.');
      }

      // Encontrar la posición en el array donde weekNumber coincide
      const weekIndex = activityData.activities.findIndex((week: any) => week.weekNumber === weekNumber);
      if (weekIndex === -1) {
        throw await errorResponse(`Error: Week ${weekNumber} was not found in the activity.`, 'updateActivityWeek');
      }

      // Crear una copia del array actual
      const updatedActivities = [...activityData.activities];

      // Actualizar solo los campos enviados en la semana específica
      updatedActivities[weekIndex] = {
        ...updatedActivities[weekIndex], // Mantiene los valores existentes
        ...updatedFields, // Actualiza solo los valores proporcionados
      };

      // Guardar el array actualizado en Firestore
      await activityRef.update({ activities: updatedActivities });

      console.log(`Semana ${weekNumber} de la actividad ${activityId} actualizada correctamente.`);
      return `Semana ${weekNumber} de la actividad ${activityId} actualizada correctamente.`;
    } catch (error) {
      console.error('Error al actualizar la actividad:', error);
      throw error;
    }
  }
  
}
