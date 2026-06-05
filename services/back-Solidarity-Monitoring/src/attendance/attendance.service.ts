import { Firestore } from '@google-cloud/firestore';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { errorResponse } from 'src/tools/function.tools';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { DataBaseServiceAttendance } from './data-base-attendance.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendanceService {
    private firestore: Firestore
    constructor(
        private readonly dataBaseServiceAttendance: DataBaseServiceAttendance

    ){
        this.firestore = new Firestore();
    }

    // Listar asistencias con filtros opcionales
    async listAttendances(filters?: { identificacion?: string; actividad?: string; fecha?: string },
        page: number = 1,
        limit: number = 10,
    ): Promise<{data: any[]; total: number; page: number; limit: number }> {
        try {
            const rawData = await this.dataBaseServiceAttendance.getAttendances(filters, page, limit);

            const { rawResults, total } = rawData;

            // Mapear resultados planos a formato deseado
            const data = rawResults.map(row => ({
                id: row.id.toString(),
                identificacion: row.identificacion,
                fecha: row.fecha ? row.fecha.toISOString().split('T')[0] : null, // Asegurar formato YYYY-MM-DD
                actividad: row.actividad,
            }));

            /* return {
                data: paginatedData,
                total,
                page,
                limit,
            }; */

            return {
                data,
                total,
                page,
                limit,
            };
        } catch (error) {
            console.log("Error in listAttendances: ", error)
            throw error;
        }

    }

    async identifyIntegrante(identificacion: string): Promise<any> {
        try {
            //console.log('Llega al servicio de identificación:', identificacion);
            const integrante = await this.dataBaseServiceAttendance.getBeneficiaryByIdentification(identificacion);
            return integrante;
        } catch (error) {
            console.log("Error in identifyIntegrante: ", error)
            throw error;
        }

    }

    private async isDuplicateAttendance(
        identificacion: string,
        actividad: string,
        fecha: string,
    ): Promise<boolean> {
        const asistenciasRef = this.firestore.collection('attendances');
        const querySnapshot = await asistenciasRef
        .where('identificacion', '==', identificacion)
        .where('actividad', '==', actividad)
        .where('fecha', '==', fecha)
        .get();
        console.log("Consulta asistencia duplicada");
        return !querySnapshot.empty; // Retorna true si ya existe una asistencia
    }

    /**
 * Registra la asistencia de un beneficiario a una actividad.
 * @param idActivity - ID de la actividad
 * @param idBeneficiary - ID del beneficiario
 * @param status - Estado de la asistencia ('present', 'absent', 'justified', 'late')
 * @returns mensaje de éxito o error
 */
    async registerAttendance(data: CreateAttendanceDto): Promise<object> {
        try {

            const { activity, documentNumber, program } = data;

            //consultar actividad por nombre para obtener su ID
            const activityRecord = await this.dataBaseServiceAttendance.findActivityByName(activity.toString());
            if (!activityRecord) {
                throw new NotFoundException(`No se encontró una actividad con el nombre ${activity}.`);
            }

            //consultar programa por nombre para obtener su ID
            const programRecord = await this.dataBaseServiceAttendance.findProgramByName(program);
            const status = 'present'; // Por defecto, se registra como presente

            // Validar que el beneficiario existe
            const integrant = await this.dataBaseServiceAttendance.getBeneficiaryByIdentification(documentNumber);
            if (!integrant) {
                throw new NotFoundException(`No se encontró un integrante con el número de documento ${documentNumber}.`);
            }

            // Validar que el estado sea válido
            const validStatuses = ['present', 'absent', 'justified', 'late'];
            if (!validStatuses.includes(status)) {
                throw new BadRequestException(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
            }

            // Obtener la fecha actual (solo fecha, sin hora)
            const today = new Date();
            const attendanceDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            const IdBeneficiary = integrant.idBeneficiary;
            const IdActivity = activityRecord.IdActivity;
            const programId = programRecord ? programRecord.IdProgram : null;

            // Verificar si ya existe un registro para este beneficiario, actividad y fecha
            const existing = await this.dataBaseServiceAttendance.findExistingAttendance(IdBeneficiary, IdActivity, attendanceDate);

            if (existing) {
            // Si ya existe, se puede actualizar el estado (opcional)
            existing.Status = status;
            existing.UpdatedAt = new Date();
            await this.dataBaseServiceAttendance.registerAttendance(existing);

            return {
                message: `Asistencia actualizada correctamente para el beneficiario ${IdBeneficiary} en la actividad ${IdActivity}`,
                attendance: existing,
            };
            }

            // Crear nuevo registro
            const newAttendance: Partial<Attendance> = {
            IdBeneficiary: IdBeneficiary,
            IdActivity: IdActivity,
            AttendanceDate: attendanceDate,
            Status: status,
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
            };
            console.log("Registro de asistencia a crear: ", newAttendance);
           await this.dataBaseServiceAttendance.registerAttendance(newAttendance);

            return {message: `Asistencia registrada exitosamente para el integrante ${IdBeneficiary} en la actividad ${IdActivity}`};
        } catch (error) {
            console.log("Error in registerAttendance: ", error)
            throw error;
        }

    }

    // Registrar inasistencia
    async registerAbsence(identificacion: string, actividad: string, motivo: string, fecha: string ): Promise<object> {
        try {
            // Validar que el integrante existe

            const integrant = await this.dataBaseServiceAttendance.getBeneficiaryByIdentification(identificacion);
            if (!integrant) {
                throw new NotFoundException(`No se encontró un integrante con el ID ${identificacion}.`);
            }
            //buscar actividad por nombre
            const activity = await this.dataBaseServiceAttendance.findActivityByName(actividad);
            console.log("Actividad encontrada: ", activity);
            if (!activity) {
                throw new NotFoundException(`No se encontró una actividad con el nombre ${actividad}.`);
            }

            // Verificar si ya existe una ausencia registrada para el mismo integrante, actividad y fecha
            const isDuplicate = await this.dataBaseServiceAttendance.isDuplicateAbsence(identificacion, actividad, fecha);

            if (isDuplicate) {
                throw new BadRequestException(`Ya existe una ausencia registrada para el integrante ${identificacion} en la actividad ${actividad} para la fecha ${fecha}.`);
            }

            // Crear un nuevo registro de inasistencia
            await this.dataBaseServiceAttendance.registerAbsence(integrant.idBeneficiary, activity.IdActivity, motivo, fecha);

            return {message: `Inasistencia registrada exitosamente para el integrante ${identificacion}`};
        } catch (error) {
            console.log("Error in registerAbsence: ", error)
            throw error;
        }

    }
}
