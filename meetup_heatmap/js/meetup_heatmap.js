// request variables -- API key should be changed/removed
apikey = '5569441f463149423a357d745a1d3f4b';
pageResults = 5000;

function make_map(groupString) {
  // Initialize arrays for later pushing
  var lats = [];
  var lons = [];
  var heatmapData = [];

  // Assembles the API query URL
  var meetupAPIurl = 'https://api.meetup.com/2/members?key=' + apikey + '&sign=true&group_urlname=' + groupString + '&page=' + pageResults + "&callback=?";

  //Makes the API request and stores each member's lat and lon in the lats/lons arrays
  $.getJSON(meetupAPIurl, function(data) {
    var results = data['results'];

    //for each member in the group's results, store their latitude and logitude individually and as a combined LatLng object
    //FIGURE OUT WHY ONLY 200 RESULT RETURNED
    for (var i = 0; i < results.length; i++) {
      var lat = results[i]['lat'];
      var lon = results[i]['lon'];

      var latlon = new google.maps.LatLng(lat, lon);
      heatmapData.push(latlon);
      lats.push(lat);
      lons.push(lon);
    }

    //Calculate median lat and lon and use to generate map center
    var medLat = median(lats);
    var medLon = median(lons);
    var center = new google.maps.LatLng(medLat, medLon);

    //Generate map centered at the calculated lat/lon
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: center,
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.HYBRID
    });

    //Generate heatmap with intensity based on number of members and overlay on map
    var numMembers = results.length;

    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      opacity: 1.0,
      radius: 20,
      maxIntensity: numMembers / 10,
      dissipating: true
    });
    heatmap.setMap(map);
    $('.spinner').remove();
  });
}

// Mathematical helper function used for calculating medians lat and lon
function median(values) {
  values.sort(function(a, b) {
    return a - b;
  });
  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}

function mapSpinner() {
  var opts = {
    lines: 12, // The number of lines to draw
    length: 22, // The length of each line
    width: 4, // The line thickness
    radius: 10, // The radius of the inner circle
    corners: 0, // Corner roundness (0..1)
    rotate: 5, // The rotation offset
    color: '#000', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };
  var target = document.getElementById('map-canvas');
  var spinner = new Spinner(opts).spin(target);
}

$(document).ready(function(){
  //function that generates a new member heatmap when a group name is entered in the form field
  $('#member-search').on('submit', function(event){
    mapSpinner();
    event.preventDefault();
    //gets string from form input and removes spaces from group name and replaces with dashes as they are written in queries
    var group = $('#member-search input').val().replace(/\s+/g, '-');
    make_map(group);
    heatmapBase = [];
  })
});