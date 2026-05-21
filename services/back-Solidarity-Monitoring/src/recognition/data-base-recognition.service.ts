import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { DocumentType } from './entities/document-type.entity';
import { Neighborhood } from './entities/neighborhood.entity';
import { Address } from './entities/address.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { City } from './entities/city.entity';
import { BiometricData } from './entities/biometric-data.entity';

@Injectable()
export class DataBaseRecognitionService {
    constructor(
        @InjectRepository(DocumentType)
        private readonly documentTypeRepository: Repository<DocumentType>,
        @InjectRepository(Neighborhood)
        private readonly neighborhoodRepository: Repository<Neighborhood>,
        @InjectRepository(Address)
        private readonly addressRepository: Repository<Address>,
        @InjectRepository(Beneficiary)
        private readonly beneficiaryRepository: Repository<Beneficiary>,
        @InjectRepository(City)
        private readonly cityRepository: Repository<City>,
        @InjectRepository(BiometricData)
        private readonly biometricDataRepository: Repository<BiometricData>,
    ) {}

    async findBeneficiaryByIdentificationOrEmail(identification: string, email: string): Promise<Boolean> {
        try {
            const beneficiary = await this.beneficiaryRepository.findOne({ where: [{ Identification: identification }, { Email: email }] });

            if (beneficiary) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error al buscar el beneficiario por identificación:", error);
            throw error;
        }
    }

    //1. Obtener o crear tipo de documento
    async getOrCreateDocumentType(documentType: string): Promise<DocumentType> {
        try {
            let docType = await this.documentTypeRepository.findOne({ where: { Name: documentType } });
            if (!docType) {
                docType = this.documentTypeRepository.create({ Name: documentType });
                await this.documentTypeRepository.save(docType);
            }
            return docType;
        } catch (error) {
            console.error("Error al obtener o crear el tipo de documento:", error);
            throw error;

        }
    }

    // 2. Procesar dirección y barrio
    // Normalmente address viene como string completo, neighborhood como string.
    // Se debe buscar o crear el barrio y la dirección.
    // Para simplificar, asumimos que ya existen o usamos un servicio auxiliar.
    async findOrCreateNeighborhood(neighborhoodName: string, city: string): Promise<Neighborhood> {
        try {
            let neighborhood = await this.neighborhoodRepository.findOne({ where: { NameNeighborhood: neighborhoodName, city: { NameCity: city } },
                relations: ['city'] });
            if (!neighborhood) {

                const getCity = await this.cityRepository.findOne({ where: { NameCity: city } });
                if (!getCity) {
                    throw new Error(`La ciudad ${city} no existe en la base de datos.`);
                }

                neighborhood = this.neighborhoodRepository.create({ NameNeighborhood: neighborhoodName, IdCity: getCity.IdCity });
                await this.neighborhoodRepository.save(neighborhood);
            }
            return neighborhood;

        } catch (error) {
            console.error("Error al obtener o crear el barrio:", error);
            throw error;
        }
    }

    // Crear dirección
    async createAddress(address: string, neighborhood: Neighborhood): Promise<void> {
        try {
            const newAddress = this.addressRepository.create({
                Street: address,
                IdCity: neighborhood.IdCity,
                IdNeighborhood: neighborhood.IdNeighborhood
            });
            await this.addressRepository.save(newAddress);
        } catch (error) {
            console.error("Error al crear la dirección:", error);
            throw error;
        }
    }

    // Crear beneficiario (este método se llamaría desde el servicio de reconocimiento después de procesar la imagen y obtener los datos)
    async createBeneficiary(dataBeneficiary: Partial<Beneficiary>): Promise<void> {
        try {

            await this.beneficiaryRepository.save(dataBeneficiary);

        } catch (error) {
            console.error("Error al crear el beneficiario:", error);
            throw error;
        }
    }

    // Guardar descriptor biométrico
    async saveBiometricData(idBeneficiary: number, descriptor: number[]): Promise<void> {
        try {
            const biometricData = this.biometricDataRepository.create({
                IdBeneficiary: idBeneficiary,
                binaryDescriptor: Buffer.from(new Float32Array(descriptor).buffer) // Convertir el array de números a un buffer
            });
            await this.biometricDataRepository.save(biometricData);

        } catch (error) {
            console.error("Error al guardar los datos biométricos:", error);
            throw error;
        }
    }

    // Obtener todos los beneficiarios con sus descriptores biométricos usando createQueryBuilder para optimizar la consulta
    async getAllBeneficiariesWithBiometricData(): Promise<Beneficiary[]> {
        try {

            // Usamos createQueryBuilder para obtener los beneficiarios junto con su descriptor biométrico más reciente
            const beneficiaries = await this.beneficiaryRepository
                .createQueryBuilder('beneficiary')
                .select(['beneficiary.IdBeneficiary', 'beneficiary.FirstName',
                    'beneficiary.LastName', 'beneficiary.Identification',
                    'beneficiary.UrlImage' , 'beneficiary.CreatedAt','biometricData.binaryDescriptor'])
                .leftJoinAndSelect('beneficiary.biometricData', 'biometricData')
                .orderBy('beneficiary.IdBeneficiary', 'DESC')
                .distinctOn(['beneficiary.IdBeneficiary'])
                .getMany();
            return beneficiaries;
        } catch (error) {
            console.error("Error al obtener los beneficiarios con datos biométricos:", error);
            throw error;
        }
    }

    // Buscar beneficiarios en FirstName o LastName usando ILIKE (case-insensitive, partial match)
    async searchBeneficiariesByName(searchTerm: string): Promise<Beneficiary[]> {
        try {
            const beneficiaries = await this.beneficiaryRepository.find({
        where: [
          { FirstName: ILike(`%${searchTerm}%`) },
          { LastName: ILike(`%${searchTerm}%`) },
        ],
        select: ['IdBeneficiary', 'FirstName', 'LastName', 'Identification'],
      });
            return beneficiaries;
        } catch (error) {
            console.error("Error al buscar beneficiarios por nombre:", error);
            throw error;
        }
    }
}
