
let map;

var geocoder;
var marker;

var url = "https://street-analyzer.herokuapp.com/qualityOverlay?minLatitude=-22.888264&maxLatitude=-22.880056&minLongitude=-47.062292&maxLongitude=-47.053390";
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
  var latlng = new google.maps.LatLng(-22.884151, -47.0578410);
  map = new google.maps.Map(document.getElementById("map"), {
    center: latlng,
    zoom: 17,
  });

  geocoder = new google.maps.Geocoder();

    marker = new google.maps.Marker({
        map: map,
        draggable: true,
    });

    marker.setPosition(latlng);

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-22.888264, -47.062292),
      new google.maps.LatLng(-22.880056, -47.053390)
    );

    let image = url;

    class USGSOverlay extends google.maps.OverlayView {
      constructor(bounds, image) {
        super();
        this.bounds = bounds;
        this.image = image;

      }
      onAdd() {
        this.div = document.createElement("div");
        this.div.style.borderStyle = "none";
        this.div.style.borderWidth = "0px";
        this.div.style.position = "absolute";
        this.div.style.opacity = "0.6";
        // Create the img element and attach it to the div.
        const img = document.createElement("img");
        img.src = this.image;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.position = "absolute";
        this.div.appendChild(img);
        // Add the element to the "overlayLayer" pane.
        const panes = this.getPanes();
        panes.overlayLayer.appendChild(this.div);
      }
      
      draw() {
        // We use the south-west and north-east
        // coordinates of the overlay to peg it to the correct position and size.
        // To do this, we need to retrieve the projection from the overlay.
        const overlayProjection = this.getProjection();
        // Retrieve the south-west and north-east coordinates of this overlay
        // in LatLngs and convert them to pixel coordinates.
        // We'll use these coordinates to resize the div.
        const sw = overlayProjection.fromLatLngToDivPixel(
          this.bounds.getSouthWest()
        );
        const ne = overlayProjection.fromLatLngToDivPixel(
          this.bounds.getNorthEast()
        );
  
        // Resize the image's div to fit the indicated dimensions.
        if (this.div) {
          this.div.style.left = sw.x + "px";
          this.div.style.top = ne.y + "px";
          this.div.style.width = ne.x - sw.x + "px";
          this.div.style.height = sw.y - ne.y + "px";
        }
    }
    onRemove() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        delete this.div;
      }
    }
    // [END maps_overlay_hideshow_onremove]
    // [START maps_overlay_hideshow_hideshowtoggle]
    /**
     *  Set the visibility to 'hidden' or 'visible'.
     */
    hide() {
      if (this.div) {
        this.div.style.visibility = "hidden";
      }
    }
    show() {
      if (this.div) {
        this.div.style.visibility = "visible";
      }
    }
    toggle() {
      if (this.div) {
        if (this.div.style.visibility === "hidden") {
          this.show();
        } else {
          this.hide();
        }
      }
    }
    toggleDOM(map) {
      if (this.getMap()) {
        this.setMap(null);
      } else {
        this.setMap(map);
      }
    }
    
  }

  
  const overlay = new USGSOverlay(bounds, image);
  overlay.setMap(map);

  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Toggle";
  toggleButton.classList.add("custom-map-control-button");
  const toggleDOMButton = document.createElement("button");
  toggleDOMButton.textContent = "Toggle DOM Attachment";
  toggleDOMButton.classList.add("custom-map-control-button");
  toggleButton.addEventListener("click", () => {
    overlay.toggle();
  });
  toggleDOMButton.addEventListener("click", () => {
    overlay.toggleDOM(map);
  });
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleDOMButton);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleButton);
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