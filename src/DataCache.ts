export default class DataCache<T, K>{

    private data: T;
    private fetchFunction: (data: T)=>Promise<void>;
    private timeToLive: number;
    private interval?: NodeJS.Timer;

    constructor(data:T, fetchFunction:(data: T)=>Promise<void>, minuteToLive:number){
        this.fetchFunction = fetchFunction;
        this.timeToLive = minuteToLive * 60 * 1000; //covert to seconds
        this.data = data;

        //get immediate data
        this.fetchFunction(this.data)
        .catch(()=>{});

    }

    public processData(){
        this.interval = setInterval(async()=>{
            try{
                await this.fetchFunction(this.data);
            }catch(err){}
        },this.timeToLive);
    }

    public get cacheData(){
        if(!this.data) return null;
        return Object.values<K>(this.data as any);
    }
}