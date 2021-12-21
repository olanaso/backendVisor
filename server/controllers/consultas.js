const sequelize = require('sequelize');
const puntos_criticos = require('../models').puntos_criticos;
module.exports = {

    geocoder,
    getTablesGeom,
    generatoGeojson,
     generatoGeojson2,
    campounicos,
    listarProyectos,
    validarWhere,
    listGeovisores,
    listwms

};


function geocoder(req, res) {

    puntos_criticos.sequelize.query(`
    
           select * from gc_geocoder('${req.body.ubigeo}','${req.body.direccion}')
    
    `, { type: sequelize.QueryTypes.SELECT })
        .then(resultset => {
            res.status(200).json(resultset)
        })
        .catch(error => {
            res.status(400).send(error)
        })

}


function getTablesGeom(req, res) {

    puntos_criticos.sequelize.query(`
   
   select 
   t.f_table_schema,t.f_table_name,capas.nombre,capas.urlwms,capas.color,capas.categoria,capas.entidad,
   (   
        select array_to_json(array_agg(row_to_json(atributes)))
        from(
        select row_to_json(t) from(
        SELECT column_name,data_type FROM information_schema.columns
            where table_name=t.f_table_name
        ) as t
        ) atributes
   ) columnas 
  
   from (
   SELECT distinct  f_table_schema,f_table_name,type  FROM geometry_columns ) t
   
    inner join capas on t.f_table_name=capas.capa

   `, { type: sequelize.QueryTypes.SELECT })
        .then(listTables => {

            res.status(200).json(listTables)
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })

}


async function generatoGeojson(req, res) {


    console.log(req.body.geometry);
    let geojson = await JSON.stringify(req.body.geometry);
    console.log(geojson)



    let arraycapas = req.body.capas;

    let array_sql = []
    for (let table of arraycapas) {
        let sql = `
        SELECT jsonb_build_object(
        'type',     'FeatureCollection',
        'features', jsonb_agg(features.feature)
        ) geojson,'${table.name}' capa,'${table.nombre_capa}' nombre_capa
        FROM (
        SELECT jsonb_build_object(
        'type',       'Feature',
        'id',         gid,
        'geometry',   ST_AsGeoJSON(geom)::jsonb,
        'properties', to_jsonb(inputs) - 'gid' - 'geom'
        ) AS feature
        FROM (
        
        SELECT a.*,(select  color  from capas where capa='${table.name}' limit 1) color FROM ${table.name} a inner join (
             SELECT  ST_GeomFromGeoJSON('${geojson}')::geography::geometry geom) b on 
       ST_Intersects(b.geom,a.geom)
       ${table.where? table.where:''} 
        ) inputs) features
          


            `;

        array_sql.push(sql)
    }


    let finalsql = array_sql.join(' union all ')


    console.log(finalsql);

    puntos_criticos.sequelize.query(finalsql, { type: sequelize.QueryTypes.SELECT })
        .then(listTables => {

            res.status(200).json(listTables)
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })

}



async function generatoGeojson2(req, res) {


    console.log(req.body.geometry);
    let geojson = await JSON.stringify(req.body.geometry);
    console.log(geojson)



    let arraycapas = req.body.capas;

    let array_sql = []
    for (let table of arraycapas) {
        let sql = `
        SELECT jsonb_build_object(
        'type',     'FeatureCollection',
        'features', jsonb_agg(features.feature)
        ) geojson,'${table.name}' capa,'${table.nombre_capa}' nombre_capa
        FROM (
        SELECT jsonb_build_object(
        'type',       'Feature',
        'id',         gid,
        'geometry',   ST_AsGeoJSON(geom)::jsonb,
        'properties', to_jsonb(inputs) - 'gid' - 'geom'
        ) AS feature
        FROM (
        
        SELECT a.*,(

    select row_to_json(t) from(
    select  color, weight, opacity, dasharray, fillopacity, fillcolor,tipo_poligono  from capas where capa='${table.name}' limit 1

        ) as t

        ) color FROM ${table.name} a inner join (
             SELECT  ST_GeomFromGeoJSON('${geojson}')::geography::geometry geom) b on 
       ST_Intersects(b.geom,a.geom)
       ${table.where? table.where:''} 
        ) inputs) features
          


            `;

        array_sql.push(sql)
    }


    let finalsql = array_sql.join(' union all ')


    console.log(finalsql);

    puntos_criticos.sequelize.query(finalsql, { type: sequelize.QueryTypes.SELECT })
        .then(listTables => {

            res.status(200).json(listTables)
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })

}


function campounicos(req, res) {

    puntos_criticos.sequelize.query(`
   
 select distinct ${req.query.campo} from ${req.query.table}

   `, { type: sequelize.QueryTypes.SELECT })
        .then(listTables => {

            res.status(200).json(listTables)
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })

}

function validarWhere(req, res) {

    puntos_criticos.sequelize.query(`
   
 select true valido from ${req.body.table} where ${req.body.where} limit 1

   `, { type: sequelize.QueryTypes.SELECT })
        .then(listTables => {

            res.status(200).json(listTables[0])
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })

}

function listarProyectos(req, res) {
    puntos_criticos.sequelize.query(` 
select *,ST_X(ST_Centroid(geom)) x,ST_Y(ST_Centroid(geom)) y from public.pmd

        `, { type: sequelize.QueryTypes.SELECT })
        .then(list => {

            res.status(200).json(list)
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })
}


function listGeovisores(req, res) {
    puntos_criticos.sequelize.query(` 
SELECT * FROM help.geovisores

        `, { type: sequelize.QueryTypes.SELECT })
        .then(list => {

            res.status(200).json(list)
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })
}


function listwms(req, res) {
    puntos_criticos.sequelize.query(` 
select * from capaswms

        `, { type: sequelize.QueryTypes.SELECT })
        .then(list => {

            res.status(200).json(list)
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })
}