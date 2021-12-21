const consultas = require('../controllers').consultas;

module.exports = (app) => {
    /*==========GET=========*/
	app.get('/api/capasddp', consultas.getTablesGeom);
	app.get('/api/campounicos', consultas.campounicos);
	app.get('/api/listaProyectos', consultas.listarProyectos);
	app.get('/api/listGeovisores', consultas.listGeovisores);
	app.get('/api/listwms', consultas.listwms);

    /*==========POST=========*/
	app.post('/api/geocoder', consultas.geocoder);
	app.post('/api/generategeojson', consultas.generatoGeojson);
	app.post('/api/generategeojson2', consultas.generatoGeojson2);
	app.post('/api/validarwhere', consultas.validarWhere);
    /*==========PUT=========*/

    /*==========DELETE=========*/

};