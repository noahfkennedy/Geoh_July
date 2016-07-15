/*****************************************************************************/
/* Map: Event Handlers */
/*****************************************************************************/
Template.Map.events({
});


/*****************************************************************************/
/* Map: Helpers */
/*****************************************************************************/
Template.Map.helpers({
});

/*****************************************************************************/
/* Map: Lifecycle Hooks */
/*****************************************************************************/

/* Notes
Line 52: creates global variable (posts, of data-type featureGroup) to store posts in
Line 100: adds posts to that featureGroup
Line 104: adds the featureGroup 'posts' to map
Line 108: outlines a function that clears all layer of aforemention featureGroup
Line 123: calls said function. I've also done this inside of populateMap,
  but decided this was marginally cleaner.
Line 59: sets global fadeRate variable dictating amount of days
  that go by before post dissapears
Line 104: if statement uses the fadeRate variable


On date and time: URL below is what I referenced
https://meteor.hackpad.com/Meteor-Cookbook-Using-Dates-and-Times-qSQCGFc06gH
If you ever want to display date&time, the moment.js package is really great for that.


Quick things to work on atm:
1. Search bar
2. Moving add post functionality to a form with a submit button somewhere
3. Giving the upvote downvote buttons functionality, i.e. sending numbers to be stored in post itself
4. housing the upvote downvote info as well as post timers to the server
5. adding photo functionality
6. making posts change color aftera certain number of votes
7. getting fb and google login working correctly on live version
*/


Template.Map.onCreated(function(){
});

Template.Map.onRendered(function(){
  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';
  Session.set('coords', null)
  var map = L.map('map', {
    doubleClickZoom: false,
    maxZoom: 19,
    enableHighAccuracy: true,
    scrollWheelZoom: false
  })
  map.setView([0, 0], 17);
  map.spin(true);
  /////Constant Geolocation Update through 'coords' session
  Tracker.autorun(function() {
    Session.set('coords', Geolocation.latLng())
    if (Session.get('coords') != null) {
      map.spin(false);
      var lat = Session.get('coords').lat;
      var lng = Session.get('coords').lng;
      map.setView([lat, lng],17);
      populateMap();
    }
    //populateMap();
  })

  var mapboxURLOne = 'https://api.mapbox.com/styles/v1/elijahk/cinw81l640021b1ma3vv2j3s6/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWxpamFoayIsImEiOiJjaWw5cnprcGkwMGRudHlsem41Mm5obWlzIn0.usfH555I6BGhzP5r-Tqfkg';

  L.tileLayer(mapboxURLOne, {
  maxZoom: 19
  }).addTo(map);

  var posts = new L.FeatureGroup();
  var fadeRate = 86400000*5
  //86400000 in a day
  var blueDot = L.icon({
    iconUrl: '/MapMarkers/BM.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0,0]
  });

  function addMarker(click) {
    if (Meteor.userId()) {
      var txt = prompt("What do you have to say about this location?");
      var time = new Date();
      //console.log(Meteor.user().services.facebook.name)
      if (txt) {
        Markers.insert({
          userId: Meteor.userId(),
          latlng: click.latlng,
          hidden: false,
          text: txt,
          //category: tag,
          createdAt: time
        });
      }
    }
    else {
      alert("Please sign in to post")
    }
  }

  function populateMap(){
    clearPosts();
    var currentTime = new Date().valueOf();
    Markers.find().map( function(u){
      var postAge = u.createdAt.valueOf();
        if(postAge > currentTime-fadeRate){
          var post = L.marker(u.latlng, {icon: blueDot});
          post.on('click', showPostContents);
          post.descrip = u.text;
          //post.addTo(map);
          posts.addLayer(post);
        }
    })
    map.addLayer(posts);
  }

  function clearPosts(){
    posts.clearLayers();
  }

  function showPostContents(e){
    var text = e
    console.log(e);
    Session.set("selectedPost", e.target.descrip);
  }

  function revealMapObjects(){
    console.log(map);
  }

  map.on('click', revealMapObjects)
  map.on('click', addMarker);
  map.on('click', populateMap);
});

Template.Map.onDestroyed(function () {
});
