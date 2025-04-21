var map;
var layer;
var activitydata = [];
var marker;

function init() {

  if (userid == whoami) {
    $('#edit-button').click(function() {
      window.location.href = 'edit.html?userid=' + userid + '&activityid=' + activityid;
    });
  }
  else {
    $('#edit-button').hide();
  }

  $('#createprops').click(function() {
    $.ajax({
      type: "POST",
      url: baseurl + "create/prop/" + userid + "/" + activityid, 
      headers: {"Authorization": authToken}, 
      data: JSON.stringify({}),
      dataType: "json", 
      success: function(response){
        window.alert("create successful");
        location.reload();
      }
    });
  });

  $('#createcomment').click(function() {
    $.ajax({
      type: "POST",
      url: baseurl + "create/comment/" + userid + "/" + activityid, 
      headers: {"Authorization": authToken}, 
      data: JSON.stringify({comment: $('#commenttext').val()}),
      dataType: "json", 
      success: function(response){
        window.alert("create successful");
        location.reload();
      }
    });
  });

  loadActivities(baseurl + 'activities/' + userid + '/' + activityid, 'none', 'none', false, activitiesLoaded);
  initMap();
  initChart();

}

function activitiesLoaded(json) {

  m = json.activities[0].media;
  for (i in m){
    var deletehtml = '';
    if (json.activities[0].userid == whoami) {
      deletehtml = ' <input type="button" onclick="apiDelete(\'media\',\'' + json.activities[0].activityid + '\',\'' + m[i].mediaid + '\')" value="Delete"></input>';
    }
    $('#media').append('<li><a target="_blank" href="' + baseurl + m[i].mediafullurl + '"><img class="fitpreview" src="' + baseurl + m[i].mediapreviewurl + '"></a>'+ deletehtml + '</li>');
  }

  p = json.activities[0].props;
  for (i in p){
    var deletehtml = '';
    if (p[i].userid == whoami) {
      deletehtml = ' <input type="button" onclick="apiDelete(\'prop\',\'' + json.activities[0].activityid + '\')" value="Delete"></input>';
    }
    $('#props').append('<li>' + p[i].userid + deletehtml + '</li>');
  }

  c = json.activities[0].comments;
  for (i in c){
    var deletehtml = '';
    if (c[i].userid == whoami) {
      deletehtml = ' <input type="button" onclick="apiDelete(\'comment\',\'' + json.activities[0].activityid + '\',\'' + c[i].commentid + '\')" value="Delete"></input>';
    }
    $('#comments').append('<li>' + c[i].comment + ' - ' + c[i].userid + ' - ' + c[i].createtime + deletehtml + '</li>');
  }

}

function initMap() {
  map = L.map('map').setView([34, -84], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  activityid = new URLSearchParams(window.location.search).get('activityid');
  $.ajax({
    url: baseurl + "data/geojson/" + activityid, 
    headers: {"Authorization": authToken}, 
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
  $.ajax({
    url: baseurl + "data/activity/" + activityid, 
    headers: {"Authorization": authToken}, 
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