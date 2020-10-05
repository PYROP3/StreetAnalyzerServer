

var url = "https://street-analyzer.herokuapp.com/qualityOverlay?minLatitude=-22.844&maxLatitude=-22.834&minLongitude=-47.062&maxLongitude=-47.052";

var apiKey = 'wGGJdt6291mfDy9xTuHmEfmUThuuJFCc';
var xhttp = new XMLHttpRequest();

/*fetch(url, {
  mode:"no-cors"
})
//document.location = url;
//xhttp.open("GET",url, true);

/*xhttp.onload = function(){
  var image = new Image();
  var response = xhr.responseText;
			var binary = ""
			
			for(i=0;i<response.length;i++){
				binary += String.fromCharCode(response.charCodeAt(i) & 0xff);
			}
			
			img.src = 'data:image/jpeg;base64,' + btoa(binary);
			var canvas = document.getElementById('showImage');
			var context = canvas.getContext('2d');
				
			context.drawImage(img,0,0);
			var snapshot = canvas.toDataURL("image/png");
			var twinImage = document.getElementById('twinImg');
			twinImage.src = snapshot;
}*/
//xhttp.send();

/*var map = tt.map({
  key: apiKey,
  container: 'map',
  center: [22 ,22],
  style: 'tomtom://vector/1/basic-main',
  source: 'vector',
  zoom: 13
});*/

getLocation();


//map.addControl(new tt.NavigationControl(), 'bottom-left');
//const ttSearchBox = new SearchBox(services, options);
//map.addControl(ttSearchBox, 'center');

function getLocation()
{
  
  if (navigator.geolocation)
    {
      navigator.geolocation.getCurrentPosition(mapa);
    }
}

function mapa(position){
  map = tt.map({
    key: apiKey,
    container: 'map',
    center: [position.coords.longitude, position.coords.latitude],
    style: 'tomtom://vector/1/basic-main',
    source: 'vector',
    zoom: 13
  });
  var marker = new tt.Marker()
  .setLngLat([position.coords.longitude, position.coords.latitude])
  .addTo(map);
  var config = {
    key: apiKey,
    style: 'tomtom://vector/1/relative',
    refresh: 30000
};

map.on('load', function() {
  //...
      map.addLayer({
          'id': 'overlay',
          'type': 'fill',
          'source': {
              'type': 'geojson',
              'data': {
                  'type': 'Feature',
                  'geometry': {
                      'type': 'Polygon',
                      'coordinates': [[[-0.2046175878910219, 51.52327158962092],
                          [-0.05355557617221507, 51.53523241868879],
                          [-0.13045987304786877, 51.46299250930767]]]
                  }
              }
          },
          'layout': {},
          'paint': {
              'fill-color': '#db356c',
              'fill-opacity': 0.5,
              'fill-outline-color': 'black'
          }
      });
  });
}

/*map.on('load', function() {
  map.addLayer({
      'id': 'overlay',
      'type': 'fill',
      'source': {
          'type': 'geojson',
          'data': {
              'type': 'Feature',
              'geometry': {
                  'type': 'Polygon',
                  'coordinates': [[[4.9486338, 52.3139782],
                      [4.9511976, 52.3149028],
                      [4.9550533, 52.3162253],
                      [4.9568229, 52.3141933],
                      [4.9566674, 52.3140014],
                      [4.9506185, 52.3119233],
                      [4.9486338, 52.3139782]]]
              }
          }
      },
      'layout': {},
      'paint': {
          'fill-color': 'black',
          'fill-opacity': 0.5,
          'fill-outline-color': 'black'
      }
  });
});*/

/*let request = new XMLHttpRequest();
request.onreadystatechange = function () {
    if (this.readyState === 4) {
        if (this.status === 200) {
            document.body.className = 'ok';
            document.location = "/qualityOverlay?minLatitude=<-22.834444>&maxLatitude=<-22.78>&minLongitude=<-47.052960>&maxLongitude=<-47.0>";
            console.log(this.responseText);
        } else if (this.response == null && this.status === 0) {
            document.body.className = 'error offline';
            console.log("The computer appears to be offline.");
        } else {
            document.body.className = 'error';
        }
    }
};
request.open("GET", "/qualityOverlay?minLatitude=<-22.834444>&maxLatitude=<-22.78>&minLongitude=<-47.052960>&maxLongitude=<-47.0>", true);
request.send(null);
/*const inputEndereco = document.getElementById('local').value;

function callbackFn(result) {

  alert(result.results[0].position.lat);
};

tt.services.fuzzySearch({
  key : apiKey,
  query : inputEndereco
}).go().then(callbackFn);*/
//street-analyzer.herokuapp.com