

// TODO: sometimes [[ ]] = {{ }}
// TODO: sub-sort for songs with same averageRank (newer is higher??)

window.addEventListener('load', (event) => {
     const list = getTop2000();
        document.querySelector(".startButton").addEventListener("click", (e) => {
        list.then(result => {
            const JSON = makeList(result).sort((a, b) => a.averageRank - b.averageRank);
            document.querySelector('.tbl-content').innerHTML = makeTableHTML(JSON.slice(0, 2000));
            
            document.querySelector('.list-container').style.display = 'block';
        }); 
        e.target.style.display = 'none';          
        
      });
});

const getTop2000 = async () => {
    const URL = 'https://nl.wikipedia.org/w/api.php?&origin=*&action=parse&page=Lijst_van_Radio_2-Top_2000%27s&contentmodel=wikitext&prop=wikitext&format=json';

    try{
        const rawData =  await fetch(URL);       
        const result = await rawData.json();
        return result.parse.wikitext;

    }catch(e){
        console.log(e)
    }
}

const makeList = (rawStr) => {   
    const JSON = [];
    const table = rawStr['*'].split('wikitable sortable')[1].split('|-');
    table.shift();      

    table.forEach((entry, i) => {        
        JSON.push(makeJSON(entry))         
    });   
    
    return JSON;
}


const makeJSON = (rawEntry) => {
    const jsonEntry = {
        'artist': null,
        'song': null,
        'ranks': [],
        'averageRank': null
    }



    const artistAndSong =  rawEntry.match(/\[{2}(.*?)\]{2}/g).map(name => name.replace(/\[|\]/g, '').substring(name.indexOf('|')-1)) // TODO: Regex must also find {{ }}
     
    jsonEntry.artist = artistAndSong[0];
    jsonEntry.song = artistAndSong[artistAndSong.length - 1];
         
    rawEntry = rawEntry.substring(rawEntry.lastIndexOf(jsonEntry.song) + jsonEntry.song.length)

    jsonEntry.ranks = rawEntry.split('||').map(entry => isNaN(Number(entry)) ? 2001 : Number(entry) );
    jsonEntry.ranks.splice(0, 2);    

    const yearlyGrowth = Array.from({length: jsonEntry.ranks.length}, (_, i) => 1 + (i * 0.01));
   
    jsonEntry.averageRank = Math.floor(((jsonEntry.ranks.reduce((a, b, i) => (a + b*yearlyGrowth[i]), 0)) / jsonEntry.ranks.length));

    return jsonEntry;
}

function makeTableHTML(array) {
    var result = "<table cellpadding='0' cellspacing='0' border='0'><tbody>";
    for(var i=0; i<array.length; i++) {
        result += "<tr>";
        // for(var j=0; j<array[i].length; j++){
        //     result += "<td>"+array[i]+"</td>";
        // }
        for (const [key, value] of Object.entries(array[i])) {
            if(key !== 'ranks'){             
                result = key === 'averageRank' ? result + "<td>"+(i+1)+"</td>" : result + "<td>"+value+"</td>";
            }   
         }
        result += "</tr>";
    }
    result += " </tbody></table>";

    return result;
}




