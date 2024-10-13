import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import PlanoInteractivo from './PlanoInteractivo';

const FormularioCotizacion = () => {
    const [movedRooms, setMovedRooms] = useState([]);
    const [totalArea, setTotalArea] = useState(0);

    const handleRoomsChange = (rooms) => {
        setMovedRooms(rooms);
        const total = rooms.reduce((acc, room) => acc + room.area, 0); // Suma de áreas
        setTotalArea(total);
    };

    const [tipoServicio, setTipoServicio] = useState('');
    const [cantidadHabitaciones, setCantidadHabitaciones] = useState(1);
    const [tamanoHabitacion, setTamanoHabitacion] = useState('mediana');
    const [areaBodega, setAreaBodega] = useState('');
    const [estucar, setEstucar] = useState(false);
    const [resanar, setResanar] = useState(false);
    const [habitada, setHabitada] = useState(false);
    const [ubicacion, setUbicacion] = useState('soacha');
    const [cotizacion, setCotizacion] = useState(null);
    const [showInfo, setShowInfo] = useState('');
    const [isTracked, setIsTracked] = useState(1);
    const ENVIOS_LIMIT = 5;

    const calcularCotizacion = () => {
        let total = 0;

        switch (tipoServicio) {
            case 'habitaciones':
                let precioBase;
                switch (tamanoHabitacion) {
                    case 'pequeña':
                        precioBase = 88000;
                        break;
                    case 'mediana':
                        precioBase = 137000;
                        break;
                    case 'grande':
                        precioBase = 195000;
                        break;
                }
                total += cantidadHabitaciones * precioBase;
                break;
            case 'bodega':
                total += parseInt(areaBodega) * 13000;
                break;
            case 'casa_completa':
                total += 940000;
                break;
        }

        if (estucar) total += 18000;
        if (resanar) total += 15000;
        if (habitada) total += 9000;
        if (ubicacion !== 'soacha') total += 30000;

        return total;
    };

    const handleCalcular = async () => {

        const total = calcularCotizacion();
        setCotizacion(total);

        if (isTracked < ENVIOS_LIMIT) {
            setIsTracked(isTracked + 1);
            const data = {
                userAgent: navigator.userAgent,
                appName: 'cotizacion pintura',
                totalCotizacion: total,
            };

            try {
                const response = await fetch('https://endpointlogapp-production.up.railway.app/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error('Error al registrar la visita');
                }

            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const exportarPDF = () => {
        // Calculamos la cotización actualizada
        const totalActualizado = calcularCotizacion();
        setCotizacion(totalActualizado);

        const doc = new jsPDF();

        // Establecer márgenes y dimensiones generales
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        // Obtener fecha y hora actual
        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

        // Título principal
        doc.setFontSize(24);
        doc.setTextColor(0, 0, 128); // Azul oscuro
        doc.text('Cotización Aproximada de Pintura', pageWidth / 2, margin + 10, { align: 'center' });

        // Subtítulo
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0); // Negro
        doc.text('Detalles del Servicio', margin, margin + 30);

        // Línea divisoria
        doc.setDrawColor(0, 0, 128); // Azul oscuro
        doc.setLineWidth(1);
        doc.line(margin, margin + 35, pageWidth - margin, margin + 35);

        // Información del servicio
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50); // Gris oscuro
        doc.text(`Tipo de servicio: ${tipoServicio.replace('_', ' ').charAt(0).toUpperCase() + tipoServicio.slice(1)}`, margin, margin + 50);

        if (tipoServicio === 'habitaciones') {
            doc.text(`Cantidad de habitaciones: ${cantidadHabitaciones}`, margin, margin + 60);
            doc.text(`Tamaño de habitación: ${tamanoHabitacion}`, margin, margin + 70);
        } else if (tipoServicio === 'bodega') {
        }

        // Información adicional
        doc.text(`Estucar: ${estucar ? 'Sí' : 'No'}`, margin, margin + 80);
        doc.text(`Resanar: ${resanar ? 'Sí' : 'No'}`, margin, margin + 90);
        doc.text(`Habitada: ${habitada ? 'Sí' : 'No'}`, margin, margin + 100);
        doc.text(`Ubicación: ${ubicacion === 'soacha' ? 'Soacha' : 'Otra ubicación'}`, margin, margin + 110);

        // Línea divisoria
        doc.line(margin, margin + 120, pageWidth - margin, margin + 120);

        // Cotización total
        doc.setFontSize(18);
        doc.setTextColor(255, 0, 0); // Rojo
        doc.text(`Cotización total aproximada: $${totalActualizado.toLocaleString()} COP`, pageWidth / 2, margin + 140, { align: 'center' });

        // Nota al final
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Gris claro
        doc.text('Nota: Esta es solo una cotización aproximada.', margin, pageHeight - 70);
        doc.text('El precio final puede variar según las condiciones específicas del trabajo.', margin, pageHeight - 60);

        // Añadir la fecha, hora y el texto "Generado por FWeb047"
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // Negro
        doc.text(`Fecha y hora: ${formattedDate}`, margin, pageHeight - 30);
        doc.setTextColor(180, 210, 210);
        doc.text('Generado por iwinser_app', margin, pageHeight - 20);

        // Guardar el PDF
        doc.save('cotizacion-pintura.pdf');
    };



    const InfoButton = ({ infoType }) => (
        <button
            className="ml-2 bg-gray-200 rounded-full w-5 h-5 text-sm font-bold"
            onClick={() => setShowInfo(showInfo === infoType ? '' : infoType)}
        >
            ?
        </button>
    );

    const InfoText = ({ type }) => {
        const infoTexts = {
            estucar: "Estucar se refiere a rellenar y alisar imperfecciones en la pared, como agujeros dejados por clavos o lámparas, o mejorar el acabado de los bordes de las paredes.",
            resanar: "Resanar implica reparar áreas dañadas por humedad, grietas o desprendimientos en la pared antes de pintar.",
            habitada: "Un espacio habitado implica que hay muebles o pertenencias en la habitación. Es preferible que las paredes estén despejadas para facilitar el trabajo.",
        };
        return showInfo === type ? (
            <div className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                {infoTexts[type]}
            </div>
        ) : null;
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Cotización Rápida de Pintura Interiores</h2>
            <i className="italic text-sm text-gray-600 block mt-4 mb-4">
                Recuerda que el cálculo actual no representa los valores reales, es solo un aproximado ya que no se tienen en cuenta las medidas de puertas y/o ventanas o cielorrasos, además de añadir acabados o tratados en superficies con humedad o irregularidades
            </i>
            <div>

                <PlanoInteractivo onRoomsChange={handleRoomsChange} />
            </div>

            <div className="mt-4 text-lg">
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipoServicio">
                    <h3 className='text-center text-xl font-bold'>Opcion 2 - Seleccionando el tipo de unidad a pintar</h3>
                    Tipo de Servicio
                </label>
                <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="tipoServicio"
                    value={tipoServicio}
                    onChange={(e) => setTipoServicio(e.target.value)}
                >
                    <option value="">Selecciona el tipo de servicio</option>
                    <option value="habitaciones">Habitaciones</option>
                    <option value="bodega">Bodega</option>
                    <option value="casa_completa">Casa/Apartamento Completo (1 planta)</option>
                </select>
            </div>

            {tipoServicio === 'habitaciones' && (
                <>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cantidadHabitaciones">
                            Cantidad de Habitaciones
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="cantidadHabitaciones"
                            type="number"
                            min="1"
                            value={cantidadHabitaciones}
                            onChange={(e) => setCantidadHabitaciones(parseInt(e.target.value))}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tamanoHabitacion">
                            Tamaño Promedio de Habitación
                            <InfoButton infoType="tamanos" />
                        </label>
                        <select
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="tamanoHabitacion"
                            value={tamanoHabitacion}
                            onChange={(e) => setTamanoHabitacion(e.target.value)}
                        >
                            <option value="pequeña">Pequeña</option>
                            <option value="mediana">Mediana</option>
                            <option value="grande">Grande</option>
                        </select>
                        <InfoText type="tamanos" />
                    </div>
                </>
            )}

            {tipoServicio === 'bodega' && (
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="areaBodega">
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="areaBodega"
                        type="number"
                        min="1"
                        value={areaBodega}
                        onChange={(e) => setAreaBodega(e.target.value)}
                    />
                </div>
            )}

            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={estucar}
                        onChange={(e) => setEstucar(e.target.checked)}
                    />
                    <span className="ml-2">Estucar</span>
                    <InfoButton infoType="estucar" />
                </label>
                <InfoText type="estucar" />
            </div>

            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={resanar}
                        onChange={(e) => setResanar(e.target.checked)}
                    />
                    <span className="ml-2">Resanar</span>
                    <InfoButton infoType="resanar" />
                </label>
                <InfoText type="resanar" />
            </div>

            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={habitada}
                        onChange={(e) => setHabitada(e.target.checked)}
                    />
                    <span className="ml-2">Espacio habitado</span>
                    <InfoButton infoType="habitada" />
                </label>
                <InfoText type="habitada" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ubicacion">
                    Ubicación
                </label>
                <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="ubicacion"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                >
                    <option value="soacha">Soacha</option>
                    <option value="otra">Otra ubicación</option>
                </select>
            </div>

            <div className="flex flex-col items-center justify-between">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 w-full"
                    onClick={handleCalcular}
                >
                    Calcular
                </button>
                {cotizacion && (
                    <>
                        <div className="text-xl font-bold mb-4">
                            Cotización aproximada: ${cotizacion.toLocaleString()} COP
                        </div>
                        <button
                            className="bg-red-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            onClick={exportarPDF}
                        >
                            Exportar a PDF
                        </button>
                    </>
                )}
                <a
                    href={`https://wa.me/573197954808`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center bg-green-800 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4"
                >
                    WhatsApp
                </a>
            </div>
        </div>
    );
};

export default FormularioCotizacion;