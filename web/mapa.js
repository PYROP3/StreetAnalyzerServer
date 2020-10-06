var apiKey = 'wGGJdt6291mfDy9xTuHmEfmUThuuJFCc';

getLocation();

function getLocation()
{
  if (navigator.geolocation)
    {
      //mapa(-47.052960, -22.834444);
    navigator.geolocation.getCurrentPosition(showPosition);
    //mapa(navigator.geolocation.coords.latitude, navigator.geolocation.coords.longitude);
    }
  else{
    mapa(-47.052960, -22.834444);
  }
}

function showPosition(position)
{
  mapa(position.coords.longitude, position.coords.latitude);
}

function mapa(long, lat){
  var map = tt.map({
    key: apiKey,
    container: 'map',
    center: [long, lat],
    style: 'tomtom://vector/1/basic-main',
    zoom: 10
  });
}
