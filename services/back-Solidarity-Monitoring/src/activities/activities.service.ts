import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { errorResponse } from 'src/tools/function.tools';
import { UpdateActivityDto } from './dtos/update-activity.dto';
import { DataBaseService } from './data-base.service';

@Injectable()
export class ActivitiesService {
    private firestore: Firestore;

    constructor(
      private readonly databaseService: DataBaseService,
    ) {}

    /**
     * Obtiene la lista de todas las actividades.
     * @returns Lista de actividades.
     */
    async getProgramsWithSubprogramsAndTasks(language?:number): Promise<any[]> {
      try {
        const programsAndActivities = await this.databaseService.getAllProgramsWithActivities(language);

       const structuredData = programsAndActivities.map(program => {
            const result: any = { id: program.translations[0]?.NameProgram };
            for (const sub of program.subPrograms) {
                result[sub.translations[0]?.NameSubProgram || sub.NameSubProgram] = sub.activities.map(t => t.translations[0]?.NameActivity || t.NameActivity);
            }
            return result;
        });
        //console.log('Datos estructurados:', structuredData);
        return structuredData;

      }catch (error: any) {
        console.error('Error al obtener las actividades', error);
        throw error;
      }
    }

    /**
     * Obtiene la lista de los nombres de los programas.
     * @returns Lista con los nombres de los programas.
     */
    async getProgramNames(language: number): Promise<string[]> {
        try {
          const programNames = await this.databaseService.getProgramNames(language);

          return programNames;
        } catch (error) {
          console.error('Error al obtener los nombres de los programas:', error.message || error);
          throw error;
        }
    }

  /**
   * Obtiene las actividades asociadas a un programa específico.
   * @param programName Nombre del programa.
   * @returns Las actividades del programa solicitado.
   */
  async getProgramActivities(programName: string, langId: number): Promise<any> {
      try {
        const programByName = await this.databaseService.getProgramActivities(programName, langId);

        const output: Record<string, string[]> = {};
        for (const row of programByName) {
          const subName = row.subprogramname;   // usar minúsculas
          const actName = row.activityname;     // usar minúsculas
          if (!subName) continue;
          if (!output[subName]) {
          output[subName] = [];
          }
          if (actName && !output[subName].includes(actName)) {
            output[subName].push(actName);
          }
        }
        return output;
      } catch (error) {
          console.error('Error al obtener las actividades del programa:', error);
          throw error;
      }
  }


  // reestructuración de las colecciones y los documentos para los programas, subprogramas y actividades

  async createProgram(body: any, lang?: number): Promise<string>{
    try {

      const user = await this.databaseService.findUserByIdentification(body['responsible']);
      
      const newProgram = await this.databaseService.createProgram(body, user.IdUser, lang);

      return newProgram

    } catch (error) {
      console.error('Error al crear el programa:', error.message || error);
      throw error
    }

  }

  async createSubprogram(body: any): Promise<string>{
    try {

      const subprogram = await this.databaseService.createSubprogram(body);
      return subprogram;

    } catch (error) {
      console.error('Error al crear el programa:', error);
      throw error
    }

  }

  async createActivity(body: any): Promise<string> {
    try {
      //Buscar si el programa y subprograma existe
      await this.databaseService.findProgramById(body.programId);
      await this.databaseService.findSubprogramById(body.subprogramId);

      const user = await this.databaseService.findUserByIdentification(body.activityData.responsible);

      const newActivity = await this.databaseService.createActivity(body, user.IdUser);
      for( let week = 1; week <= 4; week++) {
        body['activityData'].weekNumber = week;
        await this.databaseService.createActivityTracking(body, newActivity, user.IdUser);
      }


      return 'Activity created successfully';
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
      // Se cambia la busqueda a la base de datos relacional
      const leadUser = await this.databaseService.findUserByIdentification(id);
      const programs = await this.databaseService.getPrograms(leadUser.IdUser);

      // replicar la estructura de datos obtenida en firestore para no afectar el controlador ni el frontend
      const structuredData = programs.map(program => ({
        id: program.IdProgram.toString(),
        //name: program.NameProgram,
        //description: program.DescriptionProgram ?? '',
        responsible: program.leadUser?.Identification ?? '',
        subprograms: (program.subPrograms || []).map(sub => ({
          id: sub.IdSubProgram.toString(),
          name: sub.NameSubProgram
        }))
      }));
      //console.log('Datos estructurados:', structuredData);

      return structuredData;
    } catch (error) {
      console.error(`Error al obtener el programa para el id: ${id}`, error);
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

      const activities = await this.databaseService.getActivitiesWithTrackingsBySubProgram(parseInt(subprogramId));

      if (activities.length == 0) {
        console.log(`No se encontraron actividades para el subprograma: ${subprogramId}`);
        return [];
      }

      //transfrormar la estructura de datos obtenida de la base de datos relacional para que coincida con la estructura esperada por el controlador y el frontend
      const structuredActivities = activities.map(activity => ({
        id: activity.IdActivity.toString(),
        title: activity.NameActivity,
        activities: (activity.activityTrackings || []).map(tracking => ({
          weekNumber: tracking.WeekNumber,
          projectedActivities: tracking.PlannedActivities ?? 0,
          executedActivities: tracking.ExecutedActivities ?? 0,
          projectedAttendees: tracking.ProjectedAttendees ?? 0,
          actualAttendees: tracking.ActualAttendees ?? 0,
          responsible: activity.user?.Identification ?? ''   // identificación del responsable de la actividad
        }))
      }));

      return structuredActivities;
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

    try {
      const {
        programId,
        subprogramId,
        activityId,
        projectedActivities,
        executedActivities,
        projectedAttendees,
        actualAttendees,
        weekNumber,
      } = updateActivityDto;

      const progId = parseInt(programId, 10);
      const subProgId = parseInt(subprogramId, 10);
      const actId = parseInt(activityId, 10);

      const activity = await this.databaseService.findActivityWithSubProgramAndProgram(actId, progId);

      if (!activity) {
        throw await errorResponse(`Error: The activity with ID ${activityId} was not found.`, 'updateActivityWeek');
      }

      if (activity.subProgram?.IdProgram !== progId) {
        throw await errorResponse(`Error: The activity with ID ${activityId} does not belong to the specified program.`, 'updateActivityWeek');
      }

      const tracking = await this.databaseService.findActivityTrackingByActivityAndWeek(actId, weekNumber);

      if (!tracking) {
        throw await errorResponse(`Error: Week ${weekNumber} was not found in the activity.`, 'updateActivityWeek');
      }

      // Actualizar solo los campos que fueron enviados en el DTO
      tracking.PlannedActivities = projectedActivities;
      tracking.ExecutedActivities = executedActivities;
      tracking.ProjectedAttendees = projectedAttendees;
      tracking.ActualAttendees = actualAttendees;
      await this.databaseService.updateActivityTracking(tracking);

      return `Semana ${weekNumber} de la actividad ${activityId} actualizada correctamente.`;
    } catch (error) {
      console.error('Error al actualizar la actividad:', error);
      throw error;
    }
  }

}
