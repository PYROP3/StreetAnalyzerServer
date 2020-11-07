
let map;

var geocoder;
var marker;

var url = "https://street-analyzer.herokuapp.com/qualityOverlay?minLatitude=-22.887264maxLatitude=-22.881056&minLongitude=-47.054390&maxLongitude=-47.00292";
var xhttp = new XMLHttpRequest();

fetch(url, {
  mode:"no-cors"
})
xhttp.open("GET",url, true);

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

function initMap() {
  var latlng = new google.maps.LatLng(-18.8800397, -47.05878999999999);
  map = new google.maps.Map(document.getElementById("map"), {
    center: latlng,
    zoom: 8,
  });

  geocoder = new google.maps.Geocoder();

    marker = new google.maps.Marker({
        map: map,
        draggable: true,
    });

    marker.setPosition(latlng);

    class USGSOverlay extends google.maps.OverlayView {
      constructor(bounds, image) {
        super();
        this.bounds = bounds;
        this.image = image;
      }
    }
}

if(navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position){ // callback de sucesso
      // ajusta a posição do marker para a localização do usuário
      marker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
  }, 
  function(error){ // callback de erro
     alert('Erro ao obter localização!');
     console.log('Erro ao obter localização.', error);
  });
} else {
  console.log('Navegador não suporta Geolocalização!');
}