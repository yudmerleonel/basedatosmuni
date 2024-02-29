// Configuración de tu aplicación Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBfCoKAiwlA9LVhxLDc9ArXVmK_Vkcoids",
    authDomain: "documentos-f975e.firebaseapp.com",
    projectId: "documentos-f975e",
    storageBucket: "documentos-f975e.appspot.com",
    messagingSenderId: "275056170278",
    appId: "1:275056170278:web:beacf5aa8e218445795de7"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// También puedes usar Firestore para interactuar con la base de datos
const db = firebase.firestore();
const storage = firebase.storage();

// Evento para manejar el envío del formulario
$(document).ready(function () {
    $('.send').click(function (event) {
        event.preventDefault(); // Evitar el comportamiento predeterminado del botón de enviar
        guardarDocumento(); // Llamar a la función para guardar el documento
    });

    $('.buscar_button').click(function (event) {
        event.preventDefault(); // Evitar el comportamiento predeterminado del botón
        var expediente = $('#documentos_busqueda').val().trim();
        // Limpiar los resultados anteriores
        $('.nombre_doc').text('');
        $('.expediente_doc').text('');
        $('.ubicacion_doc').text('');
        // Realizar la búsqueda del documento por el número de expediente
        buscarDocumentoPorExpediente(expediente);
    });


});

// Función para guardar el documento en Firebase
function guardarDocumento() {
    var nombreDocumento = $('#doc_Nombre').val();
    var expedienteDocumento = $('#doc_Expediente').val();
    var ubicacionDocumento = $('#doc_Ubicacion').val();

    // Comprobar si ya existe un documento con el mismo nombre y número de expediente
    var documentoExistenteRef = db.collection("documentos").where("nombre", "==", nombreDocumento).where("expediente", "==", expedienteDocumento);

    documentoExistenteRef.get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            // Si el documento no existe, crear un nuevo registro
            db.collection("documentos").add({
                nombre: nombreDocumento,
                expediente: expedienteDocumento,
                ubicacion: ubicacionDocumento
            }).then((docRef) => {
                console.log("Documento agregado con ID: ", docRef.id);
            }).catch((error) => {
                console.error("Error al agregar documento: ", error);
            });
        } else {
            // Si el documento ya existe, actualizar la ubicación
            querySnapshot.forEach((doc) => {
                db.collection("documentos").doc(doc.id).update({
                    ubicacion: ubicacionDocumento
                }).then(() => {
                    alert("Documento actualizado");
                    console.log("Ubicación actualizada para el documento con ID: ", doc.id);
                }).catch((error) => {
                    console.error("Error al actualizar ubicación: ", error);
                });
            });
        }
    }).catch((error) => {
        console.error("Error al buscar documentos: ", error);
    });

    // Limpiar los campos del formulario
    $('#doc_Nombre').val('');
    $('#doc_Expediente').val('');
    $('#doc_Ubicacion').val('');
}


// Función para verificar si ya existe un documento con el mismo nombre y expediente
function verificarDocumentoExistente(nombre, expediente) {
    return new Promise(function (resolve, reject) {
        // Consultar la base de datos para ver si existe un documento con el mismo nombre y expediente
        db.collection('documentos').where('nombre', '==', nombre).where('expediente', '==', expediente).get()
            .then(function (querySnapshot) {
                if (!querySnapshot.empty) {
                    // Si existe un documento con el mismo nombre y expediente, rechazar la promesa
                    reject('Ya existe un documento con el mismo nombre y expediente');
                } else {
                    // Si no existe un documento con el mismo nombre y expediente, resolver la promesa
                    resolve();
                }
            })
            .catch(function (error) {
                // Manejar cualquier error de la consulta
                reject(error);
            });
    });
}

// Función para buscar el documento por el número de expediente
function buscarDocumentoPorExpediente(expediente) {
    if (expediente) {
        // Realizar la consulta a Firestore para buscar el documento por expediente
        db.collection('documentos').where('expediente', '==', expediente).get()
            .then(function (querySnapshot) {
                let encontrados = false; // Variable para determinar si se encontraron resultados
                querySnapshot.forEach(function (doc) {
                    encontrados = true; // Se encontró al menos un documento
                    // Mostrar los resultados encontrados en los elementos HTML
                    $('.nombre_doc').text('Nombre del documento: ' + '\n\n' + doc.data().nombre);
                    $('.expediente_doc').text('Número de expediente: ' + '\n\n' + doc.data().expediente);
                    $('.ubicacion_doc').text('Ubicación del documento: ' + '\n\n' + doc.data().ubicacion);
                });
                // Si no se encontraron resultados, mostrar un alert
                if (!encontrados) {
                    alert('No se encontraron expedientes con el número proporcionado.');
                }
            })
            .catch(function (error) {
                console.error('Error al buscar el documento por expediente: ', error);
                alert('Ocurrió un error al buscar el documento');
            });
    } else {
        // Limpiar los resultados si no se proporciona un número de expediente
        $('.nombre_doc').text('');
        $('.expediente_doc').text('');
        $('.ubicacion_doc').text('');
        // Mostrar un alert para indicar que se debe proporcionar un número de expediente
        alert('Por favor, introduce un número de expediente para buscar el documento.');
    }
}
