export default{
    ResponseCodes:{
        ERROR: 0,
        SUCCESS:1
    },

    ResponseMessages: {
        SUCCESS: 'Ok',
        MESSAGE_SUCCESS: "¡Ok!",
        BAD_REQUEST: 'Error al consumir el servicio',
        INTERNAL_SERVER_ERROR: 'Error interno del servicio',
        UNAUTHORIZED: 'Debe autenticarse para realizar la petición',
        FORBIDDEN: 'Permisos limitados para este tipo de petición',
        NOT_FOUND: 'Consulta sin resultados',
        CREATED: 'Creado'
    },
}