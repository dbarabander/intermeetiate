var map;
var service;


function initialize() {
  var address1 = [];
  var address2 = [];
  var markers = [];
  var midPointArray = [];
  var images = [];

  geocoder = new google.maps.Geocoder();
  var mapOptions = {
    zoom: 12
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  };


$('#what_do').keypress(function(e){
        if(e.which == 13){//Enter key pressed
            $('#search').click();//Trigger search button click event
        }
    });

$('#logo').click(function(){
  document.location.href="../index.html"
});


$('#back').click(function(){
    $('#results').hide('slide', {direction: 'right'}, 700,function(){
       $('#leftcontainer').show('slide', {direction: 'right'}, 700);
    });
$('#searchdiv').addClass('edit');

});

$('ul').on('click','li', function(){
var position = $(this).data('position');
map.panTo(position);
});

$('ul').on('mouseover','li', function(){
var markerId = $(this).attr('id');
var marker = markers[markerId];
marker.setIcon("images/letter_a.png");
marker.setVisible(true)
});
//i can get rid of funciton now? remove marker? yea
$('ul').on('mouseout','li', function(){

var markerId = $(this).attr('id');
var marker = markers[markerId];
var image = images[markerId];
marker.setIcon(image);
});

$('#search').click(function(){
$('#searchdiv').addClass('searched');

//slide search boxes out and display results

$('#leftcontainer').hide('slide', {direction: 'right'}, 700, function(){
  //slides in the results when the leftcontainer finishes sliding out
  $('#results').show('slide', {direction: 'right'}, 700);
});


//plot the two locations
  var address1Val = $("#location_one").val(); 
  var address2Val = $("#location_two").val(); 

if ($('#searchdiv').hasClass('edit')){
  $('#results li').remove();

  removeMarker(markers);
  removeMarker(address1);
  removeMarker(address2);
  removeMarker(midPointArray);
  markers = [];
  images = [];
  console.log(markers);


  getGeoCodeAddress(address1Val);
  getGeoCodeAddress(address2Val);

} else {
  getGeoCodeAddress(address1Val);
  getGeoCodeAddress(address2Val);
}

$('#searchdiv').removeClass('edit');

//ensure the user cannot plot multiple locations
  // if (address1.length < 1) {
  //   address1.push(address1Val);
    // getGeoCodeAddress(address1[0]);
  // }
 

  // if (address2.length < 1) {
  //   address2.push(address2Val);
  //   getGeoCodeAddress(address2[0]);
  // }

  getGeoCodeAddress()

  function getGeoCodeAddress(address) {
    var lat_long;
    var callback = function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        lat_long_hash = results[0].geometry.location;
        // console.log(lat_long_hash);
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
    address1.push(marker);
    address2.push(marker); //  w/e w/ewait wut...? now i'm confused how ti works hahah
//yea it's irrelvant it resets address 1 and 2 but i think they're cleared later anyways.
// not anymore bc my new logic only clears [0]. old logic loops trhough.
        checkForBothLocations(lat_long_hash);
      } else {
        // alert("Geocode was not successful for the following reason: " + status);
      }
      // console.log (lat_long_hash);

    };

geocoder.geocode({'address': address}, callback);
  }

  var first_complete_lat_long_hash = {};
  var second_complete_lat_long_hash = {};

  function checkForBothLocations(lat_long_hash) {
    if ($.isEmptyObject(first_complete_lat_long_hash)) {
      // console.log("GOT ONE");
      first_complete_lat_long_hash = lat_long_hash;
    } else {
      second_complete_lat_long_hash = lat_long_hash;

      // console.log("GOT BOTH: ");
      // console.log(first_complete_lat_long_hash);
      // console.log(second_complete_lat_long_hash);
      // Now we have both.

      getMidPoint(first_complete_lat_long_hash,second_complete_lat_long_hash);
    }
  }

  function getMidPoint(first_hash,second_hash){

    lat1 = first_hash['k'];
    long1 = first_hash['B'];
    lat2 = second_hash['k'];
    long2 = second_hash['B'];
    midPointLat = (parseFloat(lat1) + parseFloat(lat2))/2;
    midPointLong = (parseFloat(long1) + parseFloat(long2))/2;
    var midPoint = new google.maps.LatLng(midPointLat,midPointLong);
    drawMidPoint(midPoint);
    getMidPointVenues(midPoint);

  }

  function drawMidPoint(midPoint){
    var image = "images/letter_m.png"
    var marker = new google.maps.Marker({
      position: midPoint,
      map: map,
      icon: image
    });
    map.panTo(midPoint);
    map.setZoom(14);
    midPointArray.push(marker);
  }

  function getMidPointVenues(midPoint){
    var venue = $('#what_do').val();
    var request = {
    location: midPoint,
    radius: '100',
    query: venue
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callbackMark);
}

function callbackMark(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // thi is better way to do it.. oringinally i had this...let me show
    // this isn't good. if u get less than 8 results back ur gonna break
    for (var i = 0; i < 8 && i < results.length; i++) {
      var place = results[i];  // this could be out of bounds if u only get, e..g, 4 results back
      createList(place,i,results);
      createMarker(place,i,results);
    }
  }
}

// btw this is redundant.. u take results[i] and results and i as parameters
function createMarker(place, i, results) {
    var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      icon: image
    });
    markers.push(marker);
    images.push(image);

  google.maps.event.addListener(marker, 'mouseover', function() {
    marker.setIcon("images/letter_a.png");
    });

  google.maps.event.addListener(marker, 'mouseout', function() {
    marker.setIcon(image);
    });    
}

function createList(place, i, results) {
    // only thing i can think of is one of these lines is failing.
    // e.g., the place doesn't have an image or something and ur
    // doing some logic that assumes an image will def be there
    // can we look at js error console?

    //of course? i thought of that 2. but the li isn't even being created (if that was true woudln't it just exist but not appear or be fucked up looking or something? )
    // idk js is weird. sometimes it short-circuits if something goes wrong
    var name = $('<div class ="name">' + place['name'] + '</div>');
    var price = $('<div class ="price">' + priceConverter(place['price_level']) + '</div>');
    var rating = $('<div class ="rating">' + place['rating'] + '</div>');
    var address = $('<div class = "address">' + addressAbbreviator(place['formatted_address']) + '</div>');
    var photo;
    if (place['photos'] && place.photos.length > 0) {
      photo = $('<div class="photo"><img src="' + getPhoto(place) + '"></div>');
    } else {
      photo = $('<div class="photo"></div>');
    }
    var left = $('<div class="left"></div>').append(name).append(price).append(rating).append(address);
    var right = $('<div class="right"></div>').append(photo);
    var li = $('<li id="'+ i +'"></li>').append(left).append(right).data('id', place['id']).data('position', place.geometry.location);

    $('#results').append(li);
}

function priceConverter(price){
  // ok here's error. maybe that one doesn't have a price?
  // yeah, and u parseInt("") or something, and it breaks.
  // we need to do this.
  var x = parseInt(price);
  if (isNaN(x)) {
    return "";
  } else {
    return Array(parseInt(price) + 1).join('$');
  }

}

function getPhoto(place){
  var photoArray = place.photos;
  return photoArray[0].getUrl({'maxWidth': 75, 'maxHeight': 75})
}

function addressAbbreviator(address){
  var addressArray = address.split(',');
  //array is 4
  newAddress = addressArray.slice(0,(addressArray.length-1));
  return newAddress
}

function removeMarker(array){
  for (index = 0; index < array.length; index++) {
  marker = array[index]
  marker.setVisible(false);
  }
}

// function removeMarker(array){
//   for (index = 0; index < (array.length); index++) {
//   var marker = array[index] // this isn't tho. we can talk about details later
//   marker.setMap(null); //yea that's confusing
  // marker.setVisible(false);
  // wuy did u change form setMap(null) to setVisible(false)
  //because it was making ALL my markers false and i didn't realize to reset when i replotted
  // ok i'm going to remove this function bc it's clearer to just do it inline
  // }
  // this doesn't do what u think it does.
  // array is a *copy* of the param. e.g.,
  // function x(a) { a = 4;}
  // var y = 3; x(y); // y is still 3. only a is changed (Which was a copy)

  // array = []; //so this is worthless b/c it's a copy. yes
  // basically array is a reference. the thing passed into the function
  // doesn't hold ALL the contens. otherwise, if u had an array of size 1 million,
  // you'd need to copy 1 million values. that's dumb. instead, it just 
  // passes the memoery address of where the array begins
  // but when you say array=, you are changing the starting location
  // of THIS array, the other one still points to old memory address
  // diagrams are useful for this. i'll explain better later
  // ok yeah starting to make sense
// }

//wtF!!! idk. just cleaned stuff up, not sure what changed. it's cleaner but the bug is still there i d
//dont get how when we're restricting !!!
// o ok. i thought the bug went away which is why i was confused. i don't think
// any logic has changed yet. yeah.

// function addMarker(marker){
//     marker.setVisible(true);
//   }

}); //click function
}
 //initialize



function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);






