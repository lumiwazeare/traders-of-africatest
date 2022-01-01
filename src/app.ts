import * as http from 'http';
import DataCache from './DataCache';
import IPhoto from './photo.model';
import getMethod from './getmethod';

//variables
const port = 3000;
type photoArray = { [key: number]: IPhoto };
const fetchPhotoFromApi = async (oldResult: photoArray) => {
    try {
        const output = await getMethod<IPhoto[]>("http://jsonplaceholder.typicode.com/photos");

        //remove duplicate method O(n). duplicate is determine by the album id
        if (output) {
            for (let i = 0; i < output.length; i++) {
                //no duplicate was dec
                if (!oldResult[output[i].albumId]) {
                    oldResult[output[i].albumId] = output[i];
                }
            }
        }
    } catch (err) {
        console.error(err);
    }

};

const dataCache = new DataCache<photoArray, IPhoto>({}, fetchPhotoFromApi, 1);

//periodically fetch new data from api every 1 minutes;
dataCache.processData();

http.createServer((req, res) => {

    if (req.method == 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });

        const data = dataCache.cacheData === null ? [] : dataCache.cacheData;
        res.write(JSON.stringify(handlePagination(data,req)));

        res.end();
    }

    else{
        res.end("Ivalid request");
    }
})
    .listen(port, () => {
        console.log(`connected to server on port ${port}`);
    });


function handlePagination(data: IPhoto[], req:http.IncomingMessage){

    const parseUrl = new URL(req.url as string, "http://localhost");
    let currentPage = 1;
    let pageSize = 10;
    let sortBy = 'none';

    if(parseUrl.searchParams)
    {
        //check the if the page query is change
        const page = parseUrl.searchParams.get('page');
        if(page){
            const parsePage = parseInt(page);
            if(parsePage && parsePage > 1) {
                currentPage = parsePage;
            }
        }

        //check the if limit query is change
        const limit = parseUrl.searchParams.get('limit');
        if(limit){
            const parseLimit = parseInt(limit);
            if(parseLimit && parseLimit > 0) {
                pageSize = parseLimit;
            }
        }

        //check the if sortBy query is change, sort can have a value of 'asc' or 'desc'
        const sort = parseUrl.searchParams.get('sortBy');
        if(sort && (sort === 'desc' || sort === 'asc')){
            sortBy = sort;
        }
    }

    const totalData = data.length;
    const copyData: IPhoto[] = [];
    const pageCount = Math.round(totalData / pageSize);
    

    for(let i = 0; i < data.length; i++){
        copyData.push({
            albumId:data[i].albumId,
            id:data[i].id,
            title:data[i].title,
            url:data[i].url,
            thumbnailUrl:data[i].thumbnailUrl
        });
    }

     //do the sorting here
     if(sortBy !== 'none'){
        copyData.sort((a, b) => {
            return (sortBy === 'asc' ? a.id - b.id : b.id - a.id);
        });
    }

    const dataArray = [];

    while(copyData.length > 0){
        dataArray.push(copyData.splice(0,pageSize));
    }


    return {
        data: (dataArray.length > 0 && currentPage <= pageCount) ? dataArray[currentPage - 1] : [],
        totalData,
        pageSize: dataArray.length > 0 ? pageSize : 0,
        pageCount,
        currentPage
    }

}