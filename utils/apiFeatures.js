class APIFeatures {
    constructor(query,queryString){
        this.query = query; // query moongose
        this.queryString = queryString; //pametros de la url
    }
    filter(){
        //1A) Filtering
        /*Estos filtros se ejecutaran si es que en el request(req) se mandan
        parametros*/
        // BUILD QUERY
        const queryObj = {...this.queryString}//get query from url
        const excludedFields = ['page','sort','limit','fields']
        excludedFields.forEach(el => delete queryObj[el])//delete queries inncesaries
        
        // 1B)Advance Filtering
        let queryStr = JSON.stringify(queryObj) //trasnformar el objeto a un string
        //agregar el '$' a los campos gte,gt,lte,lt con expresiones regulares
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) 

        //pasar el string como query al metodo find de moongose
        this.query.find(JSON.parse(queryStr)) //Build query
        return this
    }
    sorting(){
        // 2) SORTING
        if(this.queryString.sort){// verificamos que en los parametros exista la propiedad sort
            // en el query parametro reemplazar la ',' por el ' ' 
            const sortBy = this.queryString.sort.split(',').join(' ') 
            this.query = this.query.sort(sortBy) // pasar el query de ordenacion a la variable query
        }else{
            // ordenacion por defecto
            this.query = this.query.sort('-createdAt')
        }
        return this
    }
    fieldLimit(){
        // 3) FIeld limiting
        if(this.queryString.fields){
            const fields =  this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        }else{
            this.query = this.query.select('-__v')
        }
        return this
    }
    pagination(){
        // 4) Pagination
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100
        const skip = (page - 1) * limit
        
        this.query = this.query.skip(skip).limit(limit)
        
        return this
    }
}

module.exports = APIFeatures