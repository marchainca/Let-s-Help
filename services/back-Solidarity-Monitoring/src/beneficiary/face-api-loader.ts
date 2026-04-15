import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import { join } from 'path';

// Configurar canvas como entorno para face-api
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData }as any);

export async function loadFaceApiModels() {
  const modelPath = join(__dirname, '..', '..', 'models'); // Ruta donde están los modelos
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath); // Detección de rostros
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath); // Reconocimiento facial
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath); // Detección de landmarks
  console.log('Modelos de Face API cargados correctamente');
}
