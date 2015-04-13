	var canvas, ctx, flag = false, prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;
		var color = "black",opacity = 2;
		var dot_flag=false;
		var width = 600;
	    var height = 500;
		var zoom =  12;
		var flightPath = null;
	    var lng = 13;
		var lat = 77.6;
		var pointsArray=[];
		var markers=[];
		var map;
		var flightPlanCoordinates;
		var mapLatBottom=0;
		var filtered_locations=[];
		var filteredX = [];
        var filteredY = [];
		var multiPolyPointsX = [];
		var multiPolyPointsY = [];
		var overlay;
		var draw_area = false;
		/*var locations = [
		
		<?php 
				$db = new PDO('mysql:host=localhost;dbname=heypillow;charset=utf8', 'root', 'root');
				$rows = $db->query('SELECT projectname,lat,lng FROM heypillow_residential where projectname is not null and lat is not null and lng is not null');
              foreach($rows as $row) {
				echo '["'.$row[0].'",'.$row[1].','.$row[2].'],';
			  }				
		?>
               ];
		*/	   
		var locations= [
                 ['A', 13.11, 77.51, 5885],
                 ['B', 13.22, 77.62, 6426],
                 ['C', 13.03, 77.63, 4067],
                 ['D', 13.44, 77.64, 3089],
                 ['E', 13.05, 77.55, 954],
                 ['F', 13.66, 77.66, 1885]
               ];
		function getMarkers() {
			for (i = 0; i < locations.length; i++) { 
				position = new google.maps.LatLng(locations[i][1], locations[i][2]);
				addMarker(position,locations[i][0]);
			}				
		}			
		function redrawSelectionMap(){
			if(lat != map.getCenter().lat || lng != map.getCenter().lng || zoom != map.getZoom()){
				lat = map.getCenter().lat();
				lng = map.getCenter().lng();
				zoom = map.getZoom();
				var bground = "http://maps.google.com/maps/api/staticmap?sensor=false&center=" + lat + "," + lng + "&zoom=" + zoom + "&size=600x500";
				console.log(bground);
				var img = new Image();
				img.onload = function() {
					var ctx=document.getElementById("tools_sketch").getContext('2d');
					ctx.drawImage(img,0,0);
				};
				img.src = bground;

			}
		}
		function toggleVisibility()
		{ 
			clearDrawArea();
			filteredX=[];
			filteredY=[];
			filtered_locations=[];
		    var e = document.getElementById("map-canvas");
		    var e1 = document.getElementById("tools_sketch");
		    if(e.style.display == 'none') {
			   e.style.display = 'block';
			   e1.style.display = 'none';
		    }else {
			   redrawSelectionMap();
			   e.style.display = 'none';
			   e1.style.display = 'block';
		    }			   
		} 

		function initialize() {
			document.getElementById("filter").visible=false;
			var myLatLng = new google.maps.LatLng(lng,lat);
			var mapOptions = {
			  zoom: zoom,
			  center: myLatLng,
                draggable: !((typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1))
			};
			
			map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
			console.log("map created...")
//			getMarkers();
//			google.maps.event.addListener(map, 'bounds_changed', function() {
//				initializeOverlay();
//			});
//			flightPath = new google.maps.Polygon({
//			  path: [],
//			  strokeColor: 'black',
//			  strokeOpacity: 2.0,
//			  strokeWeight: 2.0,
//			  editable: false,
//			  draggable: false
//			});
		}
		function initializeOverlay(){
			overlay = new google.maps.OverlayView();
			overlay.draw = function() {};
			overlay.setMap(map);
		
		}
		function multiPolyLines(){
			console.log(multiPolyPointsX);
			for (i=0;i<multiPolyPointsX.length;i++){
				reinitializeMultiPolyLines(multiPolyPointsX[i],multiPolyPointsY[i]);
			}
		}
		function reinitializeMultiPolyLines(x,y) {
		   var e = document.getElementById("map-canvas");
		   var e1 = document.getElementById("tools_sketch");
			   e.style.display = 'block';
			   e1.style.display = 'none';
			   //console.log("filtered points " + filteredX.length);
   			var ctx=e1.getContext("2d");
			ctx.clearRect(0, 0, width, height);
			
			if (x.length>0){
				filtered_locations = [];
				for (i=0;i<x.length;i++){
					var coordinates = overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(x[i],y[i]));
					filtered_locations.push(coordinates);
					//console.log(filteredX[i] + " " + filteredY[i] + " " + coordinates);
				}
//				overlay.setMap(null);
				//console.log("filtered locations " + filtered_locations.length);
				flightPath.setPath(filtered_locations);
			    flightPath.setMap(map);
				showPolyline();
				hideMarkers();
			}
		}

		function reinitialize() {
			//init();
		   var e = document.getElementById("map-canvas");
		   var e1 = document.getElementById("tools_sketch");
			   e.style.display = 'block';
			   e1.style.display = 'none';
			   //console.log("filtered points " + filteredX.length);
   			var ctx=e1.getContext("2d");
			ctx.clearRect(0, 0, width, height);
			
			if (filteredX.length>0){
				filtered_locations = [];
				for (i=0;i<filteredX.length;i++){
					var coordinates = overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(filteredX[i],filteredY[i]));
					filtered_locations.push(coordinates);
				}
			    flightPath.setMap(map);
				showPolyline();
				hideMarkers();
			}
		}

		function showPolyline() {
			hideAllMarkers();
			flightPath.setPath(filtered_locations);
			flightPath.setMap(map);
	  }
		function hidePolyline() {
			flightPath.setPath([]);
			flightPath.setMap(null);
	  }
		function getPath() {
		   var path = flightPath.getPath();
			var len = path.getLength();
		   var coordStr = "";
		   for (var i=0; i<len; i++) {
			 coordStr += path.getAt(i).toUrlValue(6)+"<br>";
		   }
		   document.getElementById('path').innerHTML = coordStr;
		}
		// Add a marker to the map and push to the array.
		function addMarker(location, t) {
		  var marker = new google.maps.Marker({
			position: location,
			map: map,
			title: t,
			icon: '../images/RedCircle.jpg'
		  });
		  markers.push(marker);
		}
		// Sets the map on all markers in the array.
		function setAllMap(map) {
		  for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		  }
		}

		// Removes the markers from the map, but keeps them in the array.
		function clearMarkers() {
		  setAllMap(null);
		}

		// Shows any markers currently in the array.
		function showMarkers() {
			hideMarkers();
		    setAllMap(map);
		}

		// Deletes all markers in the array by removing references to them.
		function deleteMarkers() {
		  clearMarkers();
		  markers = [];
		}
		function hideMarkers() {
			for (i=0;i<markers.length;i++) {
				position = new google.maps.LatLng(locations[i][1], locations[i][2]);				
				if(!isPointInside(position)){
					markers[i].setVisible(false);
				}else{
					markers[i].setVisible(true);
				}
			}
		}
		function showAllMarkers() {
			hidePolyline();
			//clearDrawing();
		   var e = document.getElementById("map-canvas");
		   var e1 = document.getElementById("tools_sketch");
			   e.style.display = 'block';
			   e1.style.display = 'none';
			for (i=0;i<markers.length;i++) {
			    markers[i].setVisible(true);
			}
		}
		function hideAllMarkers() {
			for (i=0;i<markers.length;i++) {
			    markers[i].setVisible(false);
			}
		}
		function isPointInside(position){	
			return google.maps.geometry.poly.containsLocation(position, flightPath);
		}

		function hideAllMarkers() {
			for (i=0;i<markers.length;i++) {
			    markers[i].setVisible(false);
			}
			flightPath.setMap(null);
			//hideDrawArea();
			//clearDrawArea();
			hidePolyline();
		}
		function clearDrawArea() {
		   var canvas = document.getElementById("tools_sketch");
		   var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, width, height);
          canvas.style.display = "none";
    
		}
		function clearDrawing() {
		   var ctx = document.getElementById("tools_sketch").getContext('2d');
           ctx.clearRect(0, 0, width, height);
			
			ctx.beginPath();
			//console.log(firstX + " " + firstY + " " + lastX + " " + lastY);
			ctx.moveTo(firstX, firstY);
			ctx.lineTo(lastX, lastY);
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;
			
			ctx.closePath();
			ctx.stroke();
		}
      function init()
      {
		canvas = document.getElementById("tools_sketch");
		ctx = canvas.getContext("2d");
		w = canvas.width;
		h = canvas.height;
		ctx.clearRect(40, 40, width, height);
		canvas.addEventListener("mousemove", function (e) {
			findxy('move', e)
		}, false);
		canvas.addEventListener("mousedown", function (e) {
			findxy('down', e)
		}, false);
		canvas.addEventListener("mouseup", function (e) {
			//console.log("mouse up event");
			findxy('up', e)
		}, false);
		canvas.addEventListener("mouseout", function (e) {
			findxy('out', e)
		}, false);
	}

	function findxy(res, e) {
		if (res == 'down') {
			firstX = currX;
			firstY = currY;
			prevX = currX;
			prevY = currY;
			currX = e.clientX - canvas.offsetLeft;
			currY = e.clientY - canvas.offsetTop;
			//console.log("mouse down " + currX + " " + currY);
			filteredX.push(currX);
			filteredY.push(currY);
			flag = true;
			dot_flag = true;
			if (dot_flag) {
				ctx.beginPath();
				ctx.fillStyle = color;
				ctx.fillRect(currX, currY, 2, 2);
				ctx.closePath();
				//dot_flag = false;
			}
		}
		if (res == 'up' || res == "out") {
			flag = false;
			//console.log("dot_flag="+dot_flag);
			if (dot_flag){
				//console.log("mouse up " + currX + " " + currY);
				filteredX.push(currX);
				filteredY.push(currY);
				lastX = currX;
				lastY = currY;
				multiPolyPointsX.push(filteredX);
				multiPolyPointsY.push(filteredY);
				//console.log("finished drawing...");
				document.getElementById("filter").click();
				dot_flag=false;
				
			}
		}
		if (res == 'move') {
			if (flag) {
				prevX = currX;
				prevY = currY;
				currX = e.clientX - canvas.offsetLeft;
				currY = e.clientY - canvas.offsetTop;
				filteredX.push(currX);
				filteredY.push(currY);
				draw();
			}
		}
	}
      function getPosition(event)
      {
        var x = new Number();
        var y = new Number();
        var canvas = document.getElementById("tools_sketch");

        
        if (event.x != undefined && event.y != undefined)
        {
          x = event.x;
          y = event.y;
        }
        else // Firefox method to get the position
        {
          x = event.clientX + document.body.scrollLeft +
              document.documentElement.scrollLeft;
          y = event.clientY + document.body.scrollTop +
              document.documentElement.scrollTop;
        }

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;
        getLatLng(x,y);
//        console.log("x: " + x + "  y: " + y);
      } 
	function draw() {
		ctx.beginPath();
		ctx.moveTo(prevX, prevY);
		ctx.lineTo(currX, currY);
		ctx.strokeStyle = color;
		ctx.lineWidth = opacity;
		//console.log(x + " " + y);
		ctx.stroke();
		ctx.closePath();
	}

	function erase() {
		var m = confirm("Want to clear");
		if (m) {
			ctx.clearRect(0, 0, width, height);
			document.getElementById("tools_sketch").style.display = "none";
		}
	}

	function getLatLng(x,y){
		
		var coordinates = overlay.getProjection().fromContainerPixelToLatLng(
		new google.maps.Point(x,y)
		);

		//console.log(coordinates.lat + ", " + coordinates.lng);
		start_marker.setPosition(coordinates);
	}
	  google.maps.event.addDomListener(window, 'load', initialize);
//      document.addEventListener("DOMContentLoaded", init, false);
	  