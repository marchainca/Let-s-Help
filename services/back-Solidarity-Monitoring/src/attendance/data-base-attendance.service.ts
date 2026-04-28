import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Beneficiary } from 'src/beneficiary/entities/beneficiary.entity';
import { Repository } from 'typeorm';


@Injectable()
export class DataBaseServiceAttendance {
     constructor(
        @InjectRepository(Beneficiary)
        private readonly beneficiaryRepository: Repository<Beneficiary>
    ){}

    async getBeneficiaryByIdentification(identification: string): Promise<any> {
        try {
            console.log('Buscando beneficiario con identificación:', identification);
            // Buscar beneficiario con todas las relaciones necesarias
            const beneficiary = await this.beneficiaryRepository.findOne({
            where: { Identification: identification },
            relations: [
                'address',
                'address.city',
                'address.city.state',
                'neighborhood',
                'documentType',
                'biometricData',
            ],
            });

            console.log('Beneficiario encontrado:', beneficiary);

            if (!beneficiary) {
            throw new NotFoundException(`Beneficiario con identificación ${identification} no encontrado`);
            }

            // Construir dirección completa (calle, número, ciudad, estado)
            let fullAddress = '';
            if (beneficiary.address) {
            const address = beneficiary.address;
            const city = address.city;
            const state = city?.state;
            fullAddress = [
                address.Street,
                address.Number,
                city?.NameCity,
                state?.NameState,
            ].filter(Boolean).join(', ');
            }

            // Obtener el descriptor biométrico
            let descriptorArray: number[] = [];
            if (beneficiary.biometricData && beneficiary.biometricData.length > 0) {
                // Suponiendo que el primer elemento es el más reciente (o puedes ordenar por CreatedAt desc)
                const latestBiometric = beneficiary.biometricData.sort((a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime())[0];
                const buffer = latestBiometric.binaryDescriptor;
                if (buffer && Buffer.isBuffer(buffer)) {
                    try {
                        // Asumiendo que el buffer contiene un string JSON con el array de floats
                        const jsonString = buffer.toString('utf8');
                        descriptorArray = JSON.parse(jsonString);
                    } catch (error) {
                        console.error('Error al parsear binaryDescriptor:', error);
                    }
                }
            }

            // Obtener nombre del tipo de documento
            const documentTypeName = beneficiary.documentType?.Name || 'Cédula de ciudadanía';

            // Construir respuesta
            const result = {
            name: beneficiary.FirstName || '',
            lastName: beneficiary.LastName || '',
            email: beneficiary.Email || '',
            documentType: documentTypeName,
            documentNumber: beneficiary.Identification || '',
            birthdate: beneficiary.Birthdate ? beneficiary.Birthdate.toISOString().split('T')[0] : '',
            address: fullAddress,
            neighborhood: beneficiary.neighborhood?.NameNeighborhood || '',
            policyNumber: beneficiary.PolicyNumber || '',
            emergencyContact: beneficiary.EmergencyContact || '',
            imageUrl: beneficiary.UrlImage || '',
            descriptor: descriptorArray,
            createdAt: beneficiary.CreatedAt ? beneficiary.CreatedAt.toISOString() : '',
            };

            return result;
        } catch (error) {
            console.error('Error en getBeneficiaryByIdentification:', error);
            throw error;
        }
    }
}