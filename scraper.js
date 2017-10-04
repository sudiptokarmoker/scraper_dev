var webserver = require('webserver');
var server = webserver.create();
var port = require('system').env.PORT || 8080; // default back to 8080

var service = server.listen(port, function(request, response) {
	var webPage = require('webpage');
	var page = webPage.create(), count = 0, forcedRenderTimeout, renderTimeout;
	page.settings.clearMemoryCaches = true;
	var str = request.url;
	var resourceWait  = 300, maxRenderWait = 10000, url_to_scrap = str.split("/?url=");
	function doRender() {
		var content = page.content;
		response.statusCode = 200;
		response.write(content);
		response.close();
		setTimeout(function() {
		  setTimeout(function() {
		    page.close();
		  }, 1);
		}, 1000);
	}

	page.onResourceRequested = function(requestData, request) {
	    count += 1;
	    clearTimeout(renderTimeout);
	};
	
	page.onResourceReceived = function (res) {
		if (!res.stage || res.stage === 'end') {
			count -= 1;
			if (count === 0) {
			    renderTimeout = setTimeout(doRender, resourceWait);
			}
		}
	};
	
	page.open(url_to_scrap[1], function (status) {
		//console.log("Status CODE : " + response.statusCode);
		//console.log("Host : " + response.host);
		if (status !== "success") {
			response.statusCode = 200;
			response.write("fail");
			response.close();
			setTimeout(function() {
			  setTimeout(function() {
			    page.close();
			  }, 1);
			}, 1000);
		} 
		else{
			forcedRenderTimeout = setTimeout(function () {
				doRender();
			}, maxRenderWait);
		}
	});
});
