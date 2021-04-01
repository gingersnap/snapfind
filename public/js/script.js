window.onload = function() { 


	document.getElementById("showMap").onclick = function(){
		console.log("test2");
		document.getElementById("mapdiv").classList.toggle("hidden");
		console.log(document.getElementById("map").dataset.src);
		document.getElementById("map").src=document.getElementById("map").dataset.src;

	}
}