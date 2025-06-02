import { prisma } from './lib/prisma';

const agregarDatosALaBase = async () => {
  const scene = await prisma.escenario.create({
    data: {
      id: '123456',
      nombre: 'CocinaTest',
      imagenUrl: 'https://res.cloudinary.com/dhsx2g5ez/image/upload/image_xrozbw.webp',
      objetos: {
        createMany: {
          data: [
            {
              nombre: 'Tenedor',
              coordenadas: '[[559, 631],[618, 604],[715, 705],[683, 738]]',
              imagenUrl: 'https://res.cloudinary.com/dhsx2g5ez/image/upload/tenedor_i24tpf.webp',
              videoSenaUrl: 'https://res.cloudinary.com/dhignxely/video/upload/v1746375570/fonoej_mzxth6.mp4',
            },
            {
              nombre: 'Cuchillo',
              coordenadas: '[[559, 631],[618, 604],[715, 705],[683, 738]]',
              imagenUrl: 'https://res.cloudinary.com/dhsx2g5ez/image/upload/cuchillo_ovirp5.webp',
              videoSenaUrl: 'https://res.cloudinary.com/dhsx2g5ez/video/upload/Cuchillo.mp4',
            },
            {
              nombre: 'Cuchara',
              coordenadas: '[]',
              imagenUrl: 'https://res.cloudinary.com/dhsx2g5ez/image/upload/cuchara_usbvwr.webp',
              videoSenaUrl: 'https://res.cloudinary.com/dhsx2g5ez/video/upload/Cuchara_jahdxg.mp4',
            },
            {
              nombre: 'Microondas',
              coordenadas: '[]',
              imagenUrl: 'https://res.cloudinary.com/dhsx2g5ez/image/upload/microondas_plflqi.webp',
              videoSenaUrl: 'https://res.cloudinary.com/dhsx2g5ez/video/upload/microondas_yurgvz.mp4',
            },
            {
              nombre: 'Lavarropas',
              coordenadas: '[]',
              imagenUrl: 'https://res.cloudinary.com/dhsx2g5ez/image/upload/image_xrozbw.webp',
              videoSenaUrl: 'https://res.cloudinary.com/dhsx2g5ez/video/upload/lavadora_aanpq9.mp4',
            },
            /*{
              nombre: 'Plato',
            },
            {
              nombre: 'Vaso',
            }*/
          ],
        },
      },
    },
  });
  console.log(scene);
};

agregarDatosALaBase().then(() => {
  console.log('Datos agregados a la base');
});