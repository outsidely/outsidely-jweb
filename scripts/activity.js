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
    apiAction(baseurl + "create/prop/" + userid + "/" + activityid, 'POST');
  });

  $('#createcomment').click(function() {
    apiAction(baseurl + "create/comment/" + userid + "/" + activityid, 'POST', {comment: $('#commenttext').val()});
  });

  loadActivities(baseurl + 'activities/' + userid + '/' + activityid, false, activitiesLoaded);

}

function activitiesLoaded(json) {

  hasGps = true;
  try {
    if (json.activities[0]["gps"] != "1") {
      hasGps = false;
    }
  }
  catch (e) {}
  if (hasGps) {
    $('#map').show();
    $('#chartdiv').show();
    initMap();
    initChart();
  }

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
    $('#props').append('<li><a href="user.html?userid=' + p[i].userid + '">@' + p[i].userid + '</a>' + deletehtml + '</li>');
  }

  c = json.activities[0].comments;
  for (i in c){
    var deletehtml = '';
    if (c[i].userid == whoami) {
      deletehtml = ' <input type="button" onclick="apiDelete(\'comment\',\'' + json.activities[0].activityid + '\',\'' + c[i].commentid + '\')" value="Delete" class="commentDelete"></input>';
    }
    $('#comments').append('<li><span class="commentText">' + c[i].comment + '</span> - <span class="commentUserid"><a href="user.html?userid=' + c[i].userid + '">@' + c[i].userid + '</a></span> - <span class="commentDate">(' + c[i].createtime + ')</span>' + deletehtml + '</li>');
  }

}

function initMap() {
  map = L.map('map').setView([34, -84], 13);
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      subdomains:['a','b','c'],
      maxZoom: 19,
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map presentation: &copy; OpenTopoMap (CC-BY-SA)'
  }).addTo(map);
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
