var map;
var layer;
var activitydata = [];
var marker;

function init() {
    qs = new URLSearchParams(window.location.search);
    loadActivities(baseurl + 'activities/' + qs.get('userid') + '/' + qs.get('activityid'), 'none', 'none', false);
    initMap();
    initChart();
}

function initMap() {
  map = L.map('map').setView([34, -84], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  activityid = new URLSearchParams(window.location.search).get('activityid');
  const getCookieValue = (name) => (document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '');
  $.ajax({
    url:"https://outsidely-geo-app.azurewebsites.net/api/data/geojson/" + activityid, 
    headers: {"Authorization": "Basic " + getCookieValue("key")}, 
    dataType: "json", 
    success: function(response){
      addGeoJson(response);
    }
  });
}

function addGeoJson(geojson){
  layer = L.geoJSON(geojson).addTo(map);
  map.fitBounds(layer.getBounds());
}

function initChart() {
  activityid = new URLSearchParams(window.location.search).get('activityid');
  const getCookieValue = (name) => (document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '');
  $.ajax({
    url:"https://outsidely-geo-app.azurewebsites.net/api/data/activity/" + activityid, 
    headers: {"Authorization": "Basic " + getCookieValue("key")}, 
    dataType: "json", 
    success: function(response){
      createChart(response);
    }
  });
}

function createChart(in_data) {

  activitydata = in_data["data"];
  
  L.circleMarker([activitydata[activitydata.length-1]['latitude'], activitydata[activitydata.length-1]['longitude']]).setStyle({color: 'red', radius: 5}).addTo(map);
  L.circleMarker([activitydata[0]['latitude'], activitydata[0]['longitude']]).setStyle({color: 'green', radius: 10}).addTo(map);

  document.getElementById('chart').addEventListener('mouseout', function(e) {
    if (marker)
      {
        map.removeLayer(marker);
      }
  });

  new Chart(document.getElementById('chart'), {
    type: 'line',
    data: {
      datasets: [{
        data: activitydata.map(row => ({
          x: row.timestamp,
          y: row.elevation,
        })),
        borderWidth: 1,
        fill: true,
        cubicInterpolationMode: 'default'
      }]
    },
    options: {
      elements: {
        point: {
          radius: 0,
          pointHitRadius: 10
        }
      },
      tooltips: {
        mode: 'index',
        intersects: false
      },
      hover: {
        mode: 'index',
        intersect: false
      },
      maintainAspectRatio: false,
      plugins: {
          legend: {
          display: false
        }
      },
      scales: {
        x: {
          display: false
        }
      },
      onHover: (e, i) => {
        if (i[0])
        {
          loc = activitydata[i[0].index];
          if (marker)
          {
            map.removeLayer(marker);
          }
          marker = L.marker([loc['latitude'], loc['longitude']]).addTo(map);
        }
      }
    }
  });

}