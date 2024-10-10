import React, { useState } from 'react';
import Draggable from 'react-draggable';
import AddIcon from '@mui/icons-material/Add'; // Importar el ícono


// Definir estilos y colores pastel para cada tipo de habitación
const roomStyles = {
    small: { backgroundColor: '#FFDDC1', length: 2, width: 3, label: 'Habitación Pequeña' },
    medium: { backgroundColor: '#C1FFD7', length: 3, width: 4, label: 'Habitación Mediana' },
    large: { backgroundColor: '#C1E4FF', length: 4, width: 4, label: 'Habitación Grande' },
    livingRoom: { backgroundColor: '#D1C1FF', length: 4, width: 5, label: 'Sala' },
    kitchen: { backgroundColor: '#FFF1C1', length: 2, width: 4, label: 'Cocina' },
    bathroom: { backgroundColor: '#FFD1DC', length: 2, width: 3, label: 'Baño' },
};

// Componente para representar una habitación
const Room = ({ id, name, length, width, onPositionChange, style }) => {
    const handleDragStop = (e, data) => {
        const container = document.getElementById('plan-container');
        const containerRect = container.getBoundingClientRect();

        if (checkIfInsideContainer(data, containerRect)) {
            onPositionChange(id, data.x, data.y, length * width, true); // Actualiza la posición y el área si está dentro
        } else {
            onPositionChange(id, data.x, data.y, 0, false); // Si está fuera, el área es 0 pero la posición se mantiene
        }
    };

    const checkIfInsideContainer = (data, containerRect) => {
        const elementRight = data.x + 50; // 50 es el tamaño del elemento que se mueve
        const elementBottom = data.y + 50;

        return (
            elementRight >= 0 && // Asegurar que la habitación no esté completamente a la izquierda del contenedor
            data.x <= containerRect.width && // No debe exceder el borde derecho
            elementBottom >= 0 && // Asegurar que no esté completamente arriba del contenedor
            data.y <= containerRect.height // No debe exceder el borde inferior
        );
    };

    return (
        <Draggable onStop={handleDragStop}>
            <div
                style={{
                    width: `${length * 50}px`,
                    height: `${width * 50}px`,
                    border: '2px solid black',
                    textAlign: 'center',
                    lineHeight: `${width * 10}px`,
                    position: 'absolute',
                    backgroundColor: style.backgroundColor,
                }}
            >
                {name} ({length}m x {width}m)
            </div>
        </Draggable>
    );
};

// Componente principal que maneja el plano interactivo
const PlanoInteractivo = () => {
    const [rooms, setRooms] = useState([]);
    const [movedRooms, setMovedRooms] = useState([]);
    const [totalArea, setTotalArea] = useState(0);

    

    const addRoom = (type) => {
        const roomStyle = roomStyles[type];
        const newRoom = {
            id: Date.now(), // Usar un ID único para cada habitación
            name: roomStyle.label,
            length: roomStyle.length,
            width: roomStyle.width,
            style: roomStyle,
            type: type,
            x: 0,
            y: 0,
        };
        setRooms([...rooms, newRoom]);
        handlePositionChange(newRoom.id, 0, 0, newRoom.length * newRoom.width, true);
    };

    const handlePositionChange = (id, x, y, area, isInside) => {
        setMovedRooms((prevRooms) => {
            const updatedRooms = prevRooms.filter((room) => room.id !== id);
            updatedRooms.push({ id, x, y, area, isInside });
    
            // Cambiar el color de la habitación si está dentro o fuera del contenedor
            setRooms((prevRooms) => 
                prevRooms.map(room => 
                    room.id === id 
                        ? { ...room, style: { ...room.style, backgroundColor: isInside ? roomStyles[room.type].backgroundColor : '#E0E0E0' } } 
                        : room
                )
            );

            if (!isInside) {
                setRooms((prevRooms) => prevRooms.filter(room => room.id !== id));
            }
    
            // Calcular el área total
            const total = updatedRooms
                .filter((room) => room.isInside)
                .reduce((acc, room) => acc + room.area, 0);
    
            setTotalArea(total);
            return updatedRooms;
        });
    };
    

    return (
        <div>
            <h3 className='text-center text-xl font-bold'>Opcion 1 - Arrastra las habitaciones al plano</h3>
            <i>"Si estas en movil habilitar vista ordenador para una mejor experiencia"</i>
            {/* Botones para agregar habitaciones */}
            <div>
                <button
                    style={{
                        backgroundColor: '#4CAF50', /* Verde */
                        color: 'white',
                        padding: '10px 20px',
                        margin: '5px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                    onClick={() => addRoom('small')}
                >
                    <AddIcon style={{ marginRight: '5px' }} /> Agregar Habitación Pequeña
                </button>

                <button
                    style={{
                        backgroundColor: '#2196F3', /* Azul */
                        color: 'white',
                        padding: '10px 20px',
                        margin: '5px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                    onClick={() => addRoom('medium')}
                >
                    <AddIcon style={{ marginRight: '5px' }} /> Agregar Habitación Mediana
                </button>

                <button
                    style={{
                        backgroundColor: '#FFC107', /* Amarillo */
                        color: 'black',
                        padding: '10px 20px',
                        margin: '5px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                    onClick={() => addRoom('large')}
                >
                    <AddIcon style={{ marginRight: '5px' }} /> Agregar Habitación Grande
                </button>

                <button
                    style={{
                        backgroundColor: '#FF5722', /* Naranja */
                        color: 'white',
                        padding: '10px 20px',
                        margin: '5px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                    onClick={() => addRoom('livingRoom')}
                >
                    <AddIcon style={{ marginRight: '5px' }} /> Agregar Sala
                </button>

                <button
                    style={{
                        backgroundColor: '#9C27B0', /* Morado */
                        color: 'white',
                        padding: '10px 20px',
                        margin: '5px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                    onClick={() => addRoom('kitchen')}
                >
                    <AddIcon style={{ marginRight: '5px' }} /> Agregar Cocina
                </button>

                <button
                    style={{
                        backgroundColor: '#00BCD4', /* Cyan */
                        color: 'white',
                        padding: '10px 20px',
                        margin: '5px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                    onClick={() => addRoom('bathroom')}
                >
                    <AddIcon style={{ marginRight: '5px' }} /> Agregar Baño
                </button>
            </div>

            <div
                id="plan-container"
                style={{
                    width: '100%',
                    height: '500px',
                    border: '2px solid blue',
                    position: 'relative',
                    marginTop: '20px',
                }}
            >
                {rooms.map((room, index) => (
                    <Room
                        key={index}
                        id={room.id}
                        name={room.name}
                        length={room.length}
                        width={room.width}
                        style={room.style}
                        onPositionChange={handlePositionChange}
                    />
                ))}
            </div>

            {/* Mostrar el área total */}
            <div style={{ marginTop: '20px' }}>
                {}
                <h4>Área Total: {(totalArea * 2.20).toFixed(2)} m</h4>
                <h4>Valor Aproximado: {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                }).format(totalArea * 2.20 * 7000)}</h4>
            </div>
        </div>
    );
};

export default PlanoInteractivo;
