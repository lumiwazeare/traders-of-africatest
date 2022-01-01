import * as https from 'http';


export default function getMethod<T>(url: string) {
    return new Promise<T>((resolve, reject) => {
        https.get(url, res => {
            let data: Uint8Array[] = [];
            //const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';

            res.on('data', chunk => {
                data.push(chunk);
            });

            res.on('end', () => {
                //console.log('Response ended: ');
                const users = JSON.parse(Buffer.concat(data).toString());

                resolve(users);
        
            });
        }).on('error', err => {
            reject(err)
        });
    });
}