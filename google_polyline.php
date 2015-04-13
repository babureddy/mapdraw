<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta charset="utf-8">
    <title>Search properties on map</title>
    <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&libraries=geometry"></script>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
	<script src="google_polyline.js"></script>
  </head>
  <body>
	<div>
		<canvas id="tools_sketch" width="600px" height="500px" style="position:absolute;left:10px;top:40px;defaultColor:#ff0"></canvas>
    </div>
	<div id="map-canvas" style="width:600px;height:500px;position:absolute;top:40px;left:10px">
	</div>
    <div>
        <button id="show" onclick="showAllMarkers();">Show All</button> 
        <button id="draw" onclick="toggleVisibility();">Draw Area</button> 
        <input type="hidden" id="filter" onclick="reinitialize();" value="Filter" </> 
    </div>
	</body>
</html>
