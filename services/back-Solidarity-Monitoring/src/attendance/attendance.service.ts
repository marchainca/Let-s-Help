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
            const asistenciasRef = this.firestore.collection('attendances');
            let query: FirebaseFirestore.Query = asistenciasRef;

            // Aplicar filtros si se proporcionan
            if (filters?.identificacion) {
            query = query.where('identificacion', '==', filters.identificacion);
            }
            if (filters?.actividad) {
            query = query.where('actividad', '==', filters.actividad);
            }
            if (filters?.fecha) {
            query = query.where('fecha', '==', filters.fecha);
            }

            const querySnapshot = await query.get();

            /* if (querySnapshot.empty) {
            return [];
            } */

            // Transformar los documentos en un arreglo de objetos
            const allAttendances = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Implementar paginación manual
            const total = allAttendances.length;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            const paginatedData = allAttendances.slice(startIndex, endIndex);

            return {
                data: paginatedData,
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
            const { IdBeneficiary, IdActivity, status } = data;

            // Validar que el estado sea válido
            const validStatuses = ['present', 'absent', 'justified', 'late'];
            if (!validStatuses.includes(status)) {
                throw new BadRequestException(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
            }

            // Obtener la fecha actual (solo fecha, sin hora)
            const today = new Date();
            const attendanceDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

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
            const integrantesRef = this.firestore.collection('faceRecognition');
            let querySnapshot = await integrantesRef.where('documentNumber', '==', identificacion).get();
            /* const integranteRef = this.firestore.collection('faceRecognition').doc(identificacion);
            const integranteDoc = await integranteRef.get(); */

            if (querySnapshot.empty) {
            throw new NotFoundException(`No se encontró un integrante con el ID ${identificacion}.`);
            }

            // Crear un nuevo registro de inasistencia
            const inasistenciasRef = this.firestore.collection('absences');
            const newAbsenceRef = inasistenciasRef.doc();

            await newAbsenceRef.set({
            identificacion,
            actividad,
            motivo,
            fecha: fecha,
            createdAt: new Date().toISOString(),
            });

            return {message: `Inasistencia registrada exitosamente para el integrante ${identificacion}`};
        } catch (error) {
            console.log("Error in registerAbsence: ", error)
            throw error;
        }

    }
}
