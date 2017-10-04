var webserver = require('webserver');
var server = webserver.create();
var port = require('system').env.PORT || 8080; // default back to 8080



var service = server.listen(port, function(request, response) {
	
	
	var webPage = require('webpage');
	var page = webPage.create(), count = 0, forcedRenderTimeout, renderTimeout;
	var t, close_trigger = 0;
	
	page.settings.clearMemoryCaches = true;
	page.settings.loadImages = false; 
	var str = request.url;
	var resourceWait  = 300, maxRenderWait = 10000, url_to_scrap = str.split("/?url=");
	
	t = Date.now();
	
	function doRender() {
		
		
		var content = page.content;
		response.statusCode = 200;
		response.write(content);
		response.close();
		setTimeout(function() {
		  setTimeout(function() {
			  t = Date.now() - t;
			console.log('Loading time ' + t + ' msec');
			  
			  
			  close_trigger++;
			  console.log("close_trigger : " + close_trigger);
		    page.close();
		  }, 1);
		}, 1000);
	}
	
	block_urls = ['gstatic.com', 'adocean.pl', 'gemius.pl', 'twitter.com', 'facebook.net', 'facebook.com', 'planplus.rs'];
	page.onResourceRequested = function(requestData, request) {
	for(url in block_urls) {
		if(requestData.url.indexOf(block_urls[url]) !== -1) {
		    request.abort();
		    console.log(requestData.url + " aborted");
		    return;
		}
	    }
		
		
		
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
	
	/*
	block_urls = ['gstatic.com', 'adocean.pl', 'gemius.pl', 'twitter.com', 'facebook.net', 'facebook.com', 'planplus.rs'];
	page.onResourceRequested = function(requestData, request){
	    for(url in block_urls) {
		if(requestData.url.indexOf(block_urls[url]) !== -1) {
		    request.abort();
		    console.log(requestData.url + " aborted");
		    return;
		}
	    }            
	}
	*/
	
	page.open(url_to_scrap[1], function (status) {
		console.log("dev - 1");
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
			
			page.evaluate(function () {
			    console.log("PAGE LOADDED DONE");
			});
			
			forcedRenderTimeout = setTimeout(function () {
				doRender();
			}, maxRenderWait);
		}
	});
});
